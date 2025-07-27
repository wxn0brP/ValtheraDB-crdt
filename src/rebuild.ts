import { decodeMinifiedVQuery } from "./min";
import { ValtheraCRDT } from "./types";
import { sortByIds } from "./utils";

export async function rebuild(db: ValtheraCRDT, collection: string) {
    const operations = await db.find("__vcrdt__/" + collection, {}).then(res => sortByIds(res));
    await db.removeCollection(collection);

    for (const op of operations) {
        if (op.a) {
            await db._original_execute("add", {
                data: op.a,
                collection,
                id_gen: false
            });
        } else if (op.d) {
            const data = decodeMinifiedVQuery(op.d);
            await db._original_execute(op.op, {
                ...data,
                collection,
            });
        }
    }
}