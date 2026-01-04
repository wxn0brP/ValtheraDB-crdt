import { sortByIds } from "@wxn0brp/db-core";
import { collectionPrefix } from "./static.js";
export async function rebuild(db, collection) {
    const operations = await db.find(collectionPrefix + "/" + collection, {});
    await db.removeCollection(collection);
    const _db = db._target();
    const primaryDataOperations = operations.filter(op => op.p);
    for (const op of primaryDataOperations) {
        await _db.add(collection, op.p, false);
    }
    const modificationOperations = sortByIds(operations.filter(op => !op.p));
    for (const op of modificationOperations) {
        if (op.a) {
            await _db.add(collection, op.a, false);
        }
        else if (op.d) {
            await _db[op.op](collection, ...op.d);
        }
    }
}
