import { collectionPrefix } from "./static.js";
export async function makeSnapshot(db, collection) {
    const data = await db.find(collection, {});
    await db.removeCollection(collectionPrefix + "/" + collection);
    await db._target().updateOneOrAdd(collectionPrefix, { _id: collection }, { time: Date.now() });
    for (const d of data) {
        await db._target().add(collectionPrefix + "/" + collection, d, false);
    }
}
