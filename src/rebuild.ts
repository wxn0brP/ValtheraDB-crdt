import { sortByIds } from "@wxn0brp/db-core";
import { collectionPrefix } from "./static";
import { ValtheraCRDT } from "./types";

export async function rebuild(db: ValtheraCRDT, collection: string) {
    const operations = await db.find<any>({
        collection: collectionPrefix + "/" + collection,
        search: {}
    });
    await db.removeCollection(collection);

    const _db = db._target();

    const primaryDataOperations = operations.filter(op => op.p);
    for (const op of primaryDataOperations) {
        await _db.add({
            collection,
            data: op.p,
            id_gen: false
        });
    }

    const modificationOperations = sortByIds(operations.filter(op => !op.p));
    for (const op of modificationOperations) {
        if (op.a) {
            await _db.add({
                collection,
                data: op.a,
                id_gen: false
            });
        } else if (op.d) {
            await _db.c(collection)[op.op](...op.d);
        }
    }
}
