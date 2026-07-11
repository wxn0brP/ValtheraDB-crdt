# @wxn0brp/db-crdt

CRDT plugin for [@wxn0brp/db-core](https://github.com/wxn0brP/ValtheraDB-core).

Provides **Conflict-free Replicated Data Type** support — every mutation is logged
and can be replayed, enabling eventually consistent data across distributed
ValtheraDB instances.

## Installation

```bash
npm i @wxn0brp/db-crdt
```

Requires `@wxn0brp/db-core` as a peer dependency.

## Quick Start

### 1. Plugin

```typescript
import { createMemoryValthera } from "@wxn0brp/db-core";
import { createCrdtPlugin, syncBoth } from "@wxn0brp/db-crdt";

const dbA = createMemoryValthera({ users: [] });
const dbB = createMemoryValthera({ users: [] });

dbA.plugin(createCrdtPlugin());
dbB.plugin(createCrdtPlugin());

await (dbA as any).users.add({ name: "Alice" });
await (dbB as any).users.add({ name: "Bob" });

// Sync both ways
await syncBoth(dbA, dbB, "users", { rebuild: true });

console.log(await (dbA as any).users.find());
// [{ name: "Alice", … }, { name: "Bob", … }]
```

### 2. CrdtDb wrapper (recommended)

```typescript
import { createMemoryValthera } from "@wxn0brp/db-core";
import { createCrdtPlugin, crdtDb } from "@wxn0brp/db-crdt";

const db = createMemoryValthera({ posts: [] });
db.plugin(createCrdtPlugin());

const c = crdtDb(db);
await c.db.posts.add({ title: "Hello" });
await c.db.posts.add({ title: "World" });

// Compact log to snapshots
await c.compact("posts");

// Rebuild collection from log
await c.rebuild("posts");
```

### 3. Sync between two databases

```typescript
import { createCrdtPlugin, crdtDb, CrdtDb } from "@wxn0brp/db-crdt";

// Both instances must have the plugin registered
const c1 = new CrdtDb(db1);
const c2 = new CrdtDb(db2);

await c1.syncBoth(c2, "users", { rebuild: true });

// One-direction sync
await c1.syncTo(db2, "users");
await c2.syncFrom(c1, "users");
```

## API

### Plugin

#### `createCrdtPlugin(opts?)`

Creates a ValtheraDB plugin that intercepts mutations (`add`, `update`,
`updateOne`, `updateOneOrAdd`, `remove`, `removeOne`, `toggleOne`) and writes
each operation into a hidden CRDT log collection (`__vcrdt__/<collection>`).

| Option    | Type       | Default          | Description |
|-----------|------------|------------------|-------------|
| `prefix`  | `string`   | `"__vcrdt__"`    | Prefix for internal log collections. |
| `exclude` | `string[]` | `[]`             | Collection names to skip (not tracked). |

```typescript
createCrdtPlugin({ prefix: "__mycrdt__", exclude: ["audit_logs"] })
```

---

### CrdtDb

A convenience wrapper that groups a `ValtheraClass` instance with its CRDT
prefix and exposes high-level methods.

#### `crdtDb(db: ValtheraClass, prefix?: string): CrdtDb`

Factory function. Equivalent to `new CrdtDb(db, prefix)`.

#### Properties

| Name         | Type             | Description |
|-------------|------------------|-------------|
| `db`        | `ValtheraClass`  | The underlying database instance. |
| `logPrefix` | `string`         | The configured CRDT log prefix. |

#### Methods

| Method | Description |
|--------|-------------|
| `logCollection(name)` | Returns the internal log collection name (`<prefix>/<name>`). |
| `rebuild(name)` | Rebuilds a collection from its operation log. |
| `compact(name)` | Replaces the operation log with a snapshot of the current data. |
| `syncFrom(other, name, opts?)` | Pulls missing log entries from `other` into `this`. |
| `syncTo(other, name, opts?)` | Pushes missing log entries from `this` to `other`. |
| `syncBoth(other, name, opts?)` | Bidirectional sync — calls `syncTo` then `syncFrom`. |
| `getLog(name)` | Returns the raw CRDT log entries for a collection. |
| `getLogLength(name)` | Returns the number of entries in the log. |

`other` can be a `ValtheraClass` or another `CrdtDb` instance.

---

### Low-level functions

All accept an optional `prefix` parameter (defaults to `"__vcrdt__"`).

| Function | Description |
|----------|-------------|
| `rebuild(db, collection, prefix?)` | Rebuilds `collection` from its CRDT log. |
| `compact(db, collection, prefix?)` | Snapshots current data into the log. |
| `sync(my, other, collection, opts?, prefix?)` | One-way sync (pull missing log entries into `my`). |
| `syncBoth(a, b, collection, opts?)` | Two-way sync. |
| `reverseSync(my, other, collection)` | Shorthand for `sync(other, my, collection)`. |

`opts` can be a boolean (`true` = rebuild after sync) or `{ rebuild: boolean }`.

---

### SyncOpts

```typescript
interface SyncOpts {
    rebuild?: boolean; // rebuild the target collection after syncing
}
```

### SyncResult

```typescript
interface SyncResult {
    collection: string;
    copied: number;    // number of log entries copied
    changed: boolean;
    rebuild: boolean;
}

interface CollectionsSyncResult {
    collections: SyncResult[];
    copied: number;
    changed: boolean;
    rebuild: boolean;
}
```

## Advanced Usage

### Custom prefix

```typescript
db.plugin(createCrdtPlugin({ prefix: "_crdt" }));
// log collections will be named _crdt/<name>
```

### Excluding collections

```typescript
db.plugin(createCrdtPlugin({ exclude: ["sessions", "metrics"] }));
```

### Compact + Rebuild workflow

```typescript
// 1. Compact shrinks the log to a snapshot
await compact(db, "users");

// 2. The log now only contains snapshot entries (no individual ops)
const log = await db.find({ collection: "__vcrdt__/users", search: {} });
// every entry has a `p` (primary data) property

// 3. Rebuild restores the collection from the log
await rebuild(db, "users");
```

## License

MIT
