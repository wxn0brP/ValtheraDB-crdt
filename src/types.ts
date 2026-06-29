import { ValtheraCompatible } from "@wxn0brp/db-core"

export type CrdtOperation<T = any> =
    | AddOperation<T>
    | MutationOp
    | CompactOp<T>;

export interface AddOperation<T = any> {
    a: T;
}

export interface MutationOp {
    d: any;
    op: string;
}

export interface CompactOp<T = any> {
    p: T;
}

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

export interface ValtheraCRDT_Proxy {
    _target: () => ValtheraCompatible;
    rebuild: (collection: string) => Promise<void>;
    sync: (
        other: ValtheraCompatible & ValtheraCRDT_Proxy,
        collection: string,
        options?: boolean | SyncOpts
    ) => Promise<SyncResult>;
    compact: (collection: string) => Promise<void>;
}

export type ValtheraCRDT = ValtheraCompatible & ValtheraCRDT_Proxy;
