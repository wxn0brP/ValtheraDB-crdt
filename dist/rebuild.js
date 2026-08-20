import { sortByIds } from "@wxn0brp/db-core";
import { collectionPrefix } from "./static.js";
export async function rebuild(db, collection, prefix = collectionPrefix) {
    const logCol = prefix + "/" + collection;
    const operations = await db.find({
        collection: logCol,
        search: {},
    });
    await db.removeCollection(collection);
    const adapter = db.adapter;
    const primaryOps = operations.filter((op) => op.p);
    for (const op of primaryOps) {
        await adapter.add({
            collection,
            data: op.p,
            id_gen: false,
        });
    }
    const mutationOps = sortByIds(operations.filter((op) => !op.p));
    for (const op of mutationOps) {
        if (op.a) {
            await adapter.add({
                collection,
                data: op.a,
                id_gen: false,
            });
        }
        else if (op.d) {
            const { op: method, d: query } = op;
            await adapter[method]({
                collection,
                ...query,
            });
        }
    }
}
