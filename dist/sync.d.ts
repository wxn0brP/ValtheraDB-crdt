import type { ValtheraClass } from "@wxn0brp/db-core";
import type { SyncOpts, SyncResult } from "./types.js";
export declare function sync(my: ValtheraClass, other: ValtheraClass, collection: string, opts?: boolean | SyncOpts, prefix?: string): Promise<SyncResult>;
