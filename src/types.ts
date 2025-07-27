import { ValtheraCompatible } from "@wxn0brp/db-core"

export interface ValtheraCRDT extends ValtheraCompatible {
    _target: () => ValtheraCompatible;
    rebuild: (collection: string) => Promise<void>;
    sync: (other: ValtheraCRDT, collection: string, rebuild?: boolean) => Promise<void>;
    makeSnapshot: (collection: string) => Promise<void>;
}