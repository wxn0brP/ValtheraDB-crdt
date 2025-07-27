import { collectionPrefix } from "./static";
import { ValtheraCRDT } from "./types";
import { add } from "./utils";

export async function makeSnapshot(db: ValtheraCRDT, collection: string) {
    const data = await db.find(collection);
    await db.removeCollection(collectionPrefix + "/" + collection);
    await db._original_execute("updateOneOrAdd", {
        collection: collectionPrefix,
        search: { _id: collection },
        updater: { time: Date.now() },
    });

    for (const d of data) {
        await add(db, collectionPrefix + "/" + collection, d);
    }
}