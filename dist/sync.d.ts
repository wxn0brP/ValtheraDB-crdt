import { ValtheraCRDT } from "./types.js";
export declare function sync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string, rebuild?: boolean): Promise<void>;
