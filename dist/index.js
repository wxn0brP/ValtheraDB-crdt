import { rebuild } from "./rebuild.js";
import { compact } from "./snapshot.js";
import { collectionPrefix } from "./static.js";
import { sync } from "./sync.js";
import { CRDT_OPS, } from "./types.js";
export * from "./types.js";
export { compact, rebuild, sync };
function stripControl(query) {
    if (!query || typeof query !== "object")
        return query;
    const { control, ...rest } = query;
    return rest;
}
export function createCrdtPlugin(opts = {}) {
    const prefix = opts.prefix ?? collectionPrefix;
    const exclude = new Set(opts.exclude ?? []);
    let _db;
    return {
        name: "crdt",
        init(db) {
            _db = db;
        },
        async execute(ctx) {
            const result = await ctx.next();
            if (!CRDT_OPS.has(ctx.op))
                return result;
            if (!ctx.query?.collection)
                return result;
            const col = ctx.query.collection;
            if (col.startsWith(prefix + "/") || exclude.has(col))
                return result;
            const logCollection = prefix + "/" + col;
            const data = ctx.op === "add"
                ? { a: result }
                : { d: stripControl(ctx.query), op: ctx.op };
            await _db.adapter.add({
                collection: logCollection,
                data,
                id_gen: true,
            });
            return result;
        },
    };
}
export async function syncBoth(dbA, dbB, collection, options = false) {
    const first = await sync(dbA, dbB, collection, options);
    const second = await sync(dbB, dbA, collection, options);
    return {
        collections: [first, second],
        copied: first.copied + second.copied,
        changed: first.changed || second.changed,
        rebuild: first.rebuild || second.rebuild,
    };
}
export async function reverseSync(my, other, collection) {
    return await sync(other, my, collection);
}
