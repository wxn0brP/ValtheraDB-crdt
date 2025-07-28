import { collectionPrefix } from "./static.js";
async function getIds(db, collection) {
    const data = await db.find(collection, {}, {}, {}, { select: ["_id"] });
    return data.map((d) => d._id);
}
export async function sync(my, other, collection, rebuild = false) {
    const crdtCol = collectionPrefix + "/" + collection;
    const myIds = await getIds(my, crdtCol);
    const otherIds = await getIds(other, crdtCol);
    const missing = otherIds.filter(id => !myIds.includes(id));
    const getData = await other.find(crdtCol, { $in: { _id: missing } });
    for (const data of getData) {
        await my._target().add(crdtCol, data, false);
    }
    if (rebuild)
        await my.rebuild(collection);
}
