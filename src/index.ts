import { ValtheraCompatible } from "@wxn0brp/db-core";
import { rebuild } from "./rebuild";
import { makeSnapshot } from "./snapshot";
import { collectionPrefix } from "./static";
import { sync } from "./sync";
import { ValtheraCRDT } from "./types";
import { VEE } from "@wxn0brp/event-emitter";

const proxyList = [
    "add",
    "update",
    "updateOne",
    "updateOneOrAdd",
    "remove",
    "removeOne",
    "toggleOne"
];

async function processOperation(target: ValtheraCRDT, op: string, result: any, args: any[]) {
    const collection = collectionPrefix + "/" + args[0];
    const opLow = op.toLowerCase();

    let res: { _id: string } = null;
    if (opLow === "add") {
        res = await target._target().add<any>(collection, { a: result }, true);
    } else if (!opLow.includes("find") && !opLow.includes("collection")) {
        res = await target._target().add<any>(collection, { d: args.slice(1), op }, true);
    }

    return res?._id || null;
}

export function createCrdtValthera(target: ValtheraCompatible): ValtheraCRDT {
    const proxy = new Proxy(target, {
        get(target, prop: string, receiver) {
            const original = Reflect.get(target, prop, receiver);
            if (proxyList.includes(prop) && typeof original === "function") {
                return async function (...args: any[]) {
                    const result = await original.apply(target, args);

                    const opId = await processOperation(proxy, prop, result, args);
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
    }) as ValtheraCRDT;

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