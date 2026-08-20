import { rebuild } from "./rebuild.js";
import { collectionPrefix } from "./static.js";
async function getLogIds(db, logCol) {
    const data = await db.find({
        collection: logCol,
        search: {},
        findOpts: { select: ["_id"] },
    });
    return data.map((d) => d._id);
}
export async function sync(my, other, collection, opts = {}, prefix = collectionPrefix) {
    const _opts = typeof opts === "boolean" ? { rebuild: opts } : opts;
    const logCol = prefix + "/" + collection;
    const myIds = await getLogIds(my, logCol);
    const otherIds = await getLogIds(other, logCol);
    const myIdSet = new Set(myIds);
    const missing = otherIds.filter(id => !myIdSet.has(id));
    if (missing.length === 0) {
        if (_opts.rebuild)
            await rebuild(my, collection, prefix);
        return {
            collection,
            copied: 0,
            changed: false,
            rebuild: !!_opts.rebuild,
        };
    }
    const getData = await other.find({
        collection: logCol,
        search: { $in: { _id: missing } },
    });
    for (const data of getData) {
        await my.adapter.add({
            collection: logCol,
            data,
            id_gen: false,
        });
    }
    if (_opts.rebuild)
        await rebuild(my, collection, prefix);
    return {
        collection,
        copied: getData.length,
        changed: getData.length > 0,
        rebuild: !!_opts.rebuild,
    };
}
