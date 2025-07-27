import { ValtheraCRDT } from "./types";

export async function sync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string) {
    const myIds = await my._getIds(collection);
    const otherIds = await other._getIds(collection);
    const crdtCol = "__vcrdt__/" + collection;

    const missing = otherIds.filter(id => !myIds.includes(id));

    const getData = await other.find(crdtCol, { $in: { _id: missing } });
    for (const data of getData) {
        await my._original_execute("add", {
            data,
            collection: crdtCol,
            id_gen: false
        });
    }
    await my.rebuild(collection);
}