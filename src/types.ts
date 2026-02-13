import { ValtheraCompatible } from "@wxn0brp/db-core"

export interface ValtheraCRDT_Proxy {
    _target: () => ValtheraCompatible;
    rebuild: (collection: string) => Promise<void>;
    sync: (other: ValtheraCompatible & ValtheraCRDT_Proxy, collection: string, rebuild?: boolean) => Promise<void>;
    makeSnapshot: (collection: string) => Promise<void>;
}

export type ValtheraCRDT = ValtheraCompatible & ValtheraCRDT_Proxy;
