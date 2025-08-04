import { sortByIds } from "@wxn0brp/db-core";
import { collectionPrefix } from "./static.js";
export async function rebuild(db, collection) {
    const operations = await db.find(collectionPrefix + "/" + collection, {}).then(res => sortByIds(res));
    await db.removeCollection(collection);
    const _db = db._target();
    for (const op of operations) {
        if (op.a) {
            await _db.add(collection, op.a, false);
        }
        else if (op.d) {
            await _db[op.op](collection, ...op.d);
        }
    }
}
