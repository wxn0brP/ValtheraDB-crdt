import { VQuery } from "@wxn0brp/db-core/types/query";

export function decodeMinifiedVQuery(queryArray: any[]): VQuery {
    const fieldMap = {
        0: "search",
        1: "updater",
        2: "add_arg",
        3: "id_gen",
        4: "context",
    };

    const result: any = {};

    for (let i = 0; i < queryArray.length; i++) {
        if (queryArray[i] !== undefined && queryArray[i] !== null) {
            result[fieldMap[i]] = queryArray[i];
        }
    }

    return result as VQuery;
}


export function minifyVQuery(query: VQuery): any[] {
    const result = [];

    const fieldMap = {
        search: 0,
        updater: 1,
        add_arg: 2,
        id_gen: 3,
        context: 4,
    };

    for (const [key, value] of Object.entries(query)) {
        if (fieldMap[key] != undefined && value != null) {
            if (typeof value === "object" && Object.keys(value).length === 0) continue;
            result[fieldMap[key]] = value;
        }
    }

    return result;
}
