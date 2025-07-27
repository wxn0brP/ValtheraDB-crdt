import { ValtheraCRDT } from "./types";

export async function makeSnapshot(db: ValtheraCRDT, collection: string) {
    const data = await db.find(collection);
    await db.removeCollection("__vcrdt__/" + collection);
    await db._original_execute("updateOneOrAdd", {
        collection: "__vcrdt__",
        search: { _id: collection },
        updater: { time: Date.now() },
    });

    for (const d of data) {
        await db._original_execute("add", {
            data: d,
            collection: "__vcrdt__/" + collection,
            id_gen: false
        });
    }
}