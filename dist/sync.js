import { collectionPrefix } from "./static.js";
async function getIds(db, collection) {
    const data = await db.find({
        collection,
        search: {},
        findOpts: {
            select: ["_id"]
        }
    });
    return data.map((d) => d._id);
}
export async function sync(my, other, collection, opts = {}) {
    const crdtCol = collectionPrefix + "/" + collection;
    const myIds = await getIds(my, crdtCol);
    const otherIds = await getIds(other, crdtCol);
    const myIdSet = new Set(myIds);
    const missing = otherIds.filter(id => !myIdSet.has(id));
    if (missing.length === 0) {
        if (opts.rebuild)
            await my.rebuild(collection);
        return {
            collection,
            copied: 0,
            changed: false,
            rebuild: opts.rebuild
        };
    }
    const getData = await other.find({
        collection: crdtCol,
        search: { $in: { _id: missing } }
    });
    for (const data of getData) {
        await my._target().add({
            collection: crdtCol,
            data,
            id_gen: false
        });
    }
    if (opts.rebuild)
        await my.rebuild(collection);
    return {
        collection,
        copied: getData.length,
        changed: getData.length > 0,
        rebuild: opts.rebuild
    };
}
