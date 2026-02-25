import { ValtheraCompatible } from "@wxn0brp/db-core";
import { ValtheraCRDT, ValtheraCRDT_Proxy } from "./types.js";
export declare function createCrdtValthera<T extends ValtheraCompatible>(target: T): T & ValtheraCRDT_Proxy;
/**
 * Sync a collection from my to other.
 * @param my The target database that should be synced.
 * @param other The source database that should be synced from.
 * @param collection The collection to sync.
 */
export declare function reverseSync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string): Promise<void>;
