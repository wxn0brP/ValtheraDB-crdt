import { collectionPrefix } from "./static.js";
export async function makeSnapshot(db, collection) {
    const data = await db.find({ collection, search: {} });
    await db.removeCollection(collectionPrefix + "/" + collection);
    await db._target().updateOneOrAdd({
        collection: collectionPrefix,
        search: { _id: collection },
        updater: { time: Date.now() }
    });
    for (const d of data) {
        await db._target().add({
            collection: collectionPrefix + "/" + collection,
            data: { p: d },
            id_gen: false
        });
    }
}
