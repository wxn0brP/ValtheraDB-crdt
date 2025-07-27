import { ValtheraClass } from "@wxn0brp/db-core";
import { minifyVQuery } from "./min";
import { ValtheraCRDT } from "./types";
import { rebuild } from "./rebuild";
import { sync } from "./sync";
import { makeSnapshot } from "./snapshot";
import { collectionPrefix } from "./static";
import { add } from "./utils";

export function makeCRDT(_db: ValtheraClass): ValtheraCRDT {
    const db = _db as ValtheraCRDT;
    // @ts-ignore
    const originalExecute = db.execute.bind(db);
    db._original_execute = originalExecute;

    // @ts-ignore
    db.execute = async function (...args: any[]) {
        const op: string = args[0];
        const result = await originalExecute(...args);
        const collection = collectionPrefix + "/" + args[1].collection;
        const opLow = op.toLowerCase();

        if (opLow === "add") {
            await add(db, collection, { a: result }, true);
        } else if (!opLow.includes("find") && !opLow.includes("collection")) {
            await add(db, collection, { d: minifyVQuery(args[1]), op }, true);    
        }

        return result;
    }

    db.rebuild = async (collection: string) => {
        return await rebuild(db, collection);
    }

    db._getIds = async (collection: string) => {
        const data = await db.find(collectionPrefix + "/" + collection, {}, {}, {}, { select: ["_id"] });
        return data.map((d: any) => d._id);
    }

    db.sync = async (other: ValtheraCRDT, collection: string, rebuild = false) => {
        return await sync(db, other, collection, rebuild);
    }

    db.makeSnapshot = async (collection: string) => {
        return await makeSnapshot(db, collection);
    }

    return db;
}