import { VEE } from "@wxn0brp/event-emitter";
import { rebuild } from "./rebuild.js";
import { makeSnapshot } from "./snapshot.js";
import { collectionPrefix } from "./static.js";
import { sync } from "./sync.js";
const proxyList = [
    "add",
    "update",
    "updateOne",
    "updateOneOrAdd",
    "remove",
    "removeOne",
    "toggleOne"
];
async function processOperation(target, op, result, query) {
    const collection = collectionPrefix + "/" + query.collection;
    const opLow = op.toLowerCase();
    let res = null;
    const db = target._target();
    if (opLow === "add")
        res = await db.add({
            collection,
            data: { a: result },
            id_gen: true
        });
    else if (!opLow.includes("find") && !opLow.includes("collection"))
        res = await db.add({
            collection,
            data: {
                d: query,
                op
            },
            id_gen: true
        });
    return res?._id || null;
}
export function createCrdtValthera(target) {
    const proxy = new Proxy(target, {
        get(target, prop, receiver) {
            const original = Reflect.get(target, prop, receiver);
            if (proxyList.includes(prop) && typeof original === "function") {
                return async function (...args) {
                    const result = await original.apply(target, args);
                    const opId = await processOperation(proxy, prop, result, args[0]);
                    if ("emiter" in target && opId) {
                        const emiter = target.emiter;
                        if (emiter instanceof VEE) {
                            emiter.emit("crdt", opId);
                        }
                    }
                    return result;
                };
            }
            return original;
        },
        set(target, prop, value, receiver) {
            return Reflect.set(target, prop, value, receiver);
        }
    });
    proxy.rebuild = async (collection) => {
        return await rebuild(proxy, collection);
    };
    proxy.sync = async (other, collection, rebuild = false) => {
        return await sync(proxy, other, collection, rebuild);
    };
    proxy.makeSnapshot = async (collection) => {
        return await makeSnapshot(proxy, collection);
    };
    proxy._target = () => target;
    return proxy;
}
/**
 * Sync a collection from my to other.
 * @param my The target database that should be synced.
 * @param other The source database that should be synced from.
 * @param collection The collection to sync.
 */
export async function reverseSync(my, other, collection) {
    return await sync(other, my, collection);
}
