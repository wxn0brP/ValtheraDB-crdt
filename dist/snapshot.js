import { collectionPrefix } from "./static.js";
export async function compact(db, collection, prefix = collectionPrefix) {
    const logCol = prefix + "/" + collection;
    const data = await db.find({ collection, search: {} });
    await db.removeCollection(logCol);
    await db.adapter.updateOneOrAdd({
        collection: prefix,
        search: { _id: collection },
        updater: { time: Date.now() },
    });
    for (const d of data) {
        await db.adapter.add({
            collection: logCol,
            data: { p: d },
            id_gen: false,
        });
    }
}
