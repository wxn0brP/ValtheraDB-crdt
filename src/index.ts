import { ValtheraClass, ValtheraCompatible } from "@wxn0brp/db-core";
import { VQuery } from "@wxn0brp/db-core/types/query";
import { VEE } from "@wxn0brp/event-emitter";
import { rebuild } from "./rebuild";
import { makeSnapshot } from "./snapshot";
import { collectionPrefix } from "./static";
import { sync } from "./sync";
import { ValtheraCRDT, ValtheraCRDT_Proxy } from "./types";

const proxyList = [
    "add",
    "update",
    "updateOne",
    "updateOneOrAdd",
    "remove",
    "removeOne",
    "toggleOne"
];

async function processOperation(target: ValtheraCRDT_Proxy, op: string, result: any, query: VQuery) {
    const collection = collectionPrefix + "/" + query.collection;
    const opLow = op.toLowerCase();

    let res: { _id: string } = null;
    const db = target._target();

    if (opLow === "add")
        res = await db.add({
            collection,
            data: { a: result },
            id_gen: true
        });

    else if (!opLow.includes("find") && !opLow.includes("collection"))
        res = await db.add<any>({
            collection,
            data: {
                d: query,
                op
            },
            id_gen: true
        });

    return res?._id || null;
}

export function createCrdtValthera(target: ValtheraClass): ValtheraClass & ValtheraCRDT_Proxy;
export function createCrdtValthera(target: ValtheraCompatible): ValtheraCompatible & ValtheraCRDT_Proxy;
export function createCrdtValthera(target: ValtheraClass) {
    const proxy = new Proxy(target, {
        get(target, prop: string, receiver) {
            const original = Reflect.get(target, prop, receiver);
            if (proxyList.includes(prop) && typeof original === "function") {
                return async function (...args: any[]) {
                    const result = await original.apply(target, args);

                    const opId = await processOperation(proxy, prop, result, args[0]);
                    if ("emiter" in target && opId) {
                        const emiter = target.emiter as VEE;
                        if (emiter instanceof VEE) {
                            emiter.emit("crdt", opId);
                        }
                    }

                    return result;
                };
            }

            return original;
        },

        set(target, prop: string, value, receiver) {
            return Reflect.set(target, prop, value, receiver);
        }
    }) as any;

    proxy.rebuild = async (collection: string) => {
        return await rebuild(proxy, collection);
    }

    proxy.sync = async (other: ValtheraCRDT, collection: string, rebuild = false) => {
        return await sync(proxy, other, collection, rebuild);
    }

    proxy.makeSnapshot = async (collection: string) => {
        return await makeSnapshot(proxy, collection);
    }

    proxy._target = () => target;

    return proxy;
}

/**
 * Sync a collection from my to other.
 * @param my The target database that should be synced.
 * @param other The source database that should be synced from.
 * @param collection The collection to sync.
 */
export async function reverseSync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string) {
    return await sync(other, my, collection);
}
