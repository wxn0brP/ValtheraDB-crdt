import { collectionPrefix } from "./static";
import { ValtheraCRDT } from "./types";
import { add } from "./utils";

export async function sync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string, rebuild = false) {
    const myIds = await my._getIds(collection);
    const otherIds = await other._getIds(collection);
    const crdtCol = collectionPrefix + "/" + collection;

    const missing = otherIds.filter(id => !myIds.includes(id));

    const getData = await other.find(crdtCol, { $in: { _id: missing } });
    for (const data of getData) {
        await add(my, crdtCol, data);
    }
    if (rebuild) await my.rebuild(collection);
}