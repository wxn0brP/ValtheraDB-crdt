import { ValtheraClass } from "@wxn0brp/db-core"
import { VQuery } from "@wxn0brp/db-core/types/query"

export interface ValtheraCRDT extends ValtheraClass {
    rebuild: (collection: string) => Promise<void>;
    _original_execute: (op: string, query: VQuery) => Promise<any>;
    _getIds: (op: string) => Promise<string[]>;
    sync: (other: ValtheraCRDT, collection: string, rebuild?: boolean) => Promise<void>;
    makeSnapshot: (collection: string) => Promise<void>;
}