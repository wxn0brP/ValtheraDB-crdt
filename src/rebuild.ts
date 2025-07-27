import { decodeMinifiedVQuery } from "./min";
import { collectionPrefix } from "./static";
import { ValtheraCRDT } from "./types";
import { add, sortByIds } from "./utils";

export async function rebuild(db: ValtheraCRDT, collection: string) {
    const operations = await db.find(collectionPrefix + "/" + collection, {}).then(res => sortByIds(res));
    await db.removeCollection(collection);

    for (const op of operations) {
        if (op.a) {
            await add(db, collection, op.a);
        } else if (op.d) {
            const data = decodeMinifiedVQuery(op.d);
            await db._original_execute(op.op, {
                ...data,
                collection,
            });
        }
    }
}