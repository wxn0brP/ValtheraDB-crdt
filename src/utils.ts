import Data from "@wxn0brp/db-core/types/data";
import { ValtheraCRDT } from "./types";

export function sortByIds(objects: Data[]) {
    return objects.slice().sort((a, b) => {
        const [timestampA] = a._id.split("-");
        const [timestampB] = b._id.split("-");

        return timestampA.localeCompare(timestampB) || a._id.localeCompare(b._id);
    });
}

export async function add(db: ValtheraCRDT, collection: string, data: Data, id_gen = false) {
    await db._original_execute("add", {
        data,
        collection,
        id_gen
    });
}