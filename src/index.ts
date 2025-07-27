import { ValtheraCompatible } from "@wxn0brp/db-core";
import { rebuild } from "./rebuild";
import { makeSnapshot } from "./snapshot";
import { collectionPrefix } from "./static";
import { sync } from "./sync";
import { ValtheraCRDT } from "./types";

const proxyList = [
    "add",
    "update",
    "updateOne",
    "updateOneOrAdd",
    "remove",
    "removeOne",
];

async function processOperation(target: ValtheraCRDT, op: string, result: any, args: any[]) {
    const collection = collectionPrefix + "/" + args[0];
    const opLow = op.toLowerCase();

    if (opLow === "add") {
        await target._target().add(collection, { a: result }, true);
    } else if (!opLow.includes("find") && !opLow.includes("collection")) {
        await target._target().add(collection, { d: args.slice(1), op }, true);  
    }
}

export function crdtValthera(target: ValtheraCompatible): ValtheraCRDT {
    const proxy = new Proxy(target, {
        get(target, prop: string, receiver) {
            const original = Reflect.get(target, prop, receiver);
            if (proxyList.includes(prop) && typeof original === "function") {
                return async function (...args: any[]) {
                    const result = await original.apply(target, args);
                    await processOperation(proxy, prop, result, args);
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