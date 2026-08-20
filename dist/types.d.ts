import type { VQuery } from "@wxn0brp/db-core/types/query";
export type CrdtOp = "add" | "update" | "updateOne" | "updateOneOrAdd" | "remove" | "removeOne" | "toggleOne";
export declare const CRDT_OPS: ReadonlySet<string>;
export interface CrdtAddEntry<T = any> {
    a: T;
}
export interface CrdtMutationEntry {
    d: Omit<VQuery, "control">;
    op: CrdtOp;
}
export interface CrdtCompactEntry<T = any> {
    p: T;
}
export type CrdtLogEntry<T = any> = CrdtAddEntry<T> | CrdtMutationEntry | CrdtCompactEntry<T>;
export interface SyncOpts {
    rebuild?: boolean;
}
export interface SyncResult {
    collection: string;
    copied: number;
    changed: boolean;
    rebuild: boolean;
}
export interface CollectionsSyncResult {
    collections: SyncResult[];
    copied: number;
    changed: boolean;
    rebuild: boolean;
}
export interface CrdtPluginOpts {
    prefix?: string;
    exclude?: string[];
}
