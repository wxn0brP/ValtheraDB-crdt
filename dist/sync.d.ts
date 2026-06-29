import { SyncOpts, SyncResult, ValtheraCRDT } from "./types.js";
export declare function sync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string, opts?: SyncOpts): Promise<SyncResult>;
