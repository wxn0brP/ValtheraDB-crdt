import type { ValtheraClass } from "@wxn0brp/db-core";
import { ValtheraPlugin } from "@wxn0brp/db-core/types/plugin";
import { rebuild } from "./rebuild";
import { compact } from "./snapshot";
import { collectionPrefix } from "./static";
import { sync } from "./sync";
import {
    CRDT_OPS,
    CollectionsSyncResult,
    CrdtMutationEntry,
    CrdtPluginOpts,
    SyncOpts,
} from "./types";

export * from "./types";
export { compact, rebuild, sync };

function stripControl(query: any): any {
    if (!query || typeof query !== "object") return query;
    const { control, ...rest } = query;
    return rest;
}

export function createCrdtPlugin(opts: CrdtPluginOpts = {}): ValtheraPlugin {
    const prefix = opts.prefix ?? collectionPrefix;
    const exclude = new Set(opts.exclude ?? []);
    let _db: ValtheraClass;

    return {
        name: "crdt",
        init(db: ValtheraClass) {
            _db = db;
        },
        async execute(ctx) {
            const result = await ctx.next();

            if (!CRDT_OPS.has(ctx.op)) return result;
            if (!ctx.query?.collection) return result;

            const col = ctx.query.collection;
            if (col.startsWith(prefix + "/") || exclude.has(col)) return result;

            const logCollection = prefix + "/" + col;
            const data = ctx.op === "add"
                ? { a: result }
                : { d: stripControl(ctx.query), op: ctx.op } as CrdtMutationEntry;

            await _db.adapter.add({
                collection: logCollection,
                data,
                id_gen: true,
            });

            return result;
        },
    };
}

export async function syncBoth(
    dbA: ValtheraClass,
    dbB: ValtheraClass,
    collection: string,
    options: boolean | SyncOpts = false,
): Promise<CollectionsSyncResult> {
    const first = await sync(dbA, dbB, collection, options);
    const second = await sync(dbB, dbA, collection, options);

    return {
        collections: [first, second],
        copied: first.copied + second.copied,
        changed: first.changed || second.changed,
        rebuild: first.rebuild || second.rebuild,
    };
}

export async function reverseSync(
    my: ValtheraClass,
    other: ValtheraClass,
    collection: string,
) {
    return await sync(other, my, collection);
}
