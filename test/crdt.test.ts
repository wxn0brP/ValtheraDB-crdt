import { createMemoryValthera } from "@wxn0brp/db-core";
import { describe, expect, test } from "bun:test";
import { createCrdtValthera, syncBoth } from "../src";

interface User {
    _id: string;
    name: string;
    age?: number;
}

interface Task {
    _id: string;
    title: string;
    done?: boolean;
}

function createDb(data: { users?: User[]; tasks?: Task[] } = {}) {
    return createCrdtValthera(createMemoryValthera({
        users: data.users || [],
        tasks: data.tasks || [],
    }));
}

describe("crdt wrapper", () => {
    test("1. records collection helper mutations and rebuilds from the operation log", async () => {
        const db1 = createDb();
        const db2 = createDb();

        const alice = await db1.users.add({ name: "Alice" });
        await db1.users.updateOne({ _id: alice._id }, { age: 22 });

        const log = await db1["__vcrdt__/users"].find();
        expect(log).toHaveLength(2);

        const result = await db2.sync(db1, "users", true);
        expect(result).toMatchObject({
            collection: "users",
            copied: 2,
            changed: true,
            rebuild: true
        });

        expect(await db2.users.find()).toEqual([
            expect.objectContaining({
                _id: alice._id,
                name: "Alice",
                age: 22
            })
        ]);
    });

    test("2. syncBoth copies changes in both directions", async () => {
        const db1 = createDb();
        const db2 = createDb();

        const alice = await db1.users.add({ name: "Alice" });
        const bob = await db2.users.add({ name: "Bob" });

        const result = await syncBoth(db1, db2, "users", { rebuild: true });

        expect(result.copied).toBe(2);
        expect(result.changed).toBe(true);
        expect(result.rebuild).toBe(true);

        const db1Users = await db1.users.find();
        const db2Users = await db2.users.find();

        expect(db1Users.map(user => user._id).sort()).toEqual([alice._id, bob._id].sort());
        expect(db2Users.map(user => user._id).sort()).toEqual([alice._id, bob._id].sort());
    });

    test("3. sync is idempotent when called repeatedly", async () => {
        const db1 = createDb();
        const db2 = createDb();

        await db1.users.add({ name: "Alice" });

        expect(await db2.sync(db1, "users", true)).toMatchObject({
            copied: 1,
            changed: true
        });
        expect(await db2.sync(db1, "users", true)).toMatchObject({
            copied: 0,
            changed: false
        });

        expect(await db2.users.find()).toHaveLength(1);
        expect(await db2["__vcrdt__/users"].find()).toHaveLength(1);
    });

    test("4. compact keeps current data as snapshot log entries", async () => {
        const db = createDb();

        const alice = await db.users.add({ name: "Alice" });
        await db.users.add({ name: "Bob" });
        await db.users.updateOne({ _id: alice._id }, { age: 22 });

        expect(await db["__vcrdt__/users"].find()).toHaveLength(3);

        await db.compact("users");

        const compactedLog = await db["__vcrdt__/users"].find();
        expect(compactedLog).toHaveLength(2);
        expect(compactedLog.every(entry => entry.p)).toBe(true);

        await db.rebuild("users");
        expect(await db.users.find()).toEqual([
            expect.objectContaining({ name: "Alice", age: 22 }),
            expect.objectContaining({ name: "Bob" })
        ]);
    });
});
