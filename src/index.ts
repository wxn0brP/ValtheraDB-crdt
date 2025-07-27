import { Valthera } from "@wxn0brp/db";
import { makeCRDT } from "./db";
import { copyFileSync, rmdirSync } from "fs";

rmdirSync("./data", { recursive: true });
const db1 = makeCRDT(new Valthera("./data/1"));
const db2 = makeCRDT(new Valthera("./data/2"));
await db2.ensureCollection("users");
await db2.ensureCollection("__vcrdt__/users");

interface User {
    name: string;
    _id: string;
}

const alice = await db1.add<User>("users", { name: "Alice" });
const bob = await db1.add<User>("users", { name: "Bob" });

await db1.updateOne("users", { _id: alice._id }, { last_name: "Smith" });

copyFileSync("./data/1/__vcrdt__/users/1.db", "./data/2/__vcrdt__/users/1.db");
copyFileSync("./data/1/users/1.db", "./data/2/users/1.db");

await db1.updateOne("users", { _id: bob._id }, { last_name: "Lopez" });
await db2.updateOne("users", { _id: alice._id }, { age: 22 });

await db1.sync(db2, "users");
await db2.sync(db1, "users");
await db1.makeSnapshot("users");
await db2.makeSnapshot("users");