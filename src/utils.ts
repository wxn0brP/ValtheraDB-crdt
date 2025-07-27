import Data from "@wxn0brp/db-core/types/data";

export function sortByIds(objects: Data[]) {
    return objects.slice().sort((a, b) => {
        const [timestampA] = a._id.split('-');
        const [timestampB] = b._id.split('-');

        return timestampA.localeCompare(timestampB) || a._id.localeCompare(b._id);
    });
}