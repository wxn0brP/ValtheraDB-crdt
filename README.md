# @wxn0brp/db-crdt

CRDT integration for @wxn0brp/db-core.

This library provides a CRDT (Conflict-free Replicated Data Type) implementation on top of the `@wxn0brp/db-core` library. It allows you to have eventually consistent data in a distributed environment.

## Installation

```bash
yarn add github:wxn0brP/ValtheraDB-crdt
```

## Usage

```typescript
import { crdtValthera } from "@wxn0brp/db-crdt";
import { Valthera } from "@wxn0brp/db";

const db = crdtValthera(new Valthera("dir"));

// All operations are now CRDT-enabled
await db.add("my-collection", { name: "John Doe" });
```

## API

### `crdtValthera(target: ValtheraCompatible): ValtheraCRDT`

This is the main function that wraps a `@wxn0brp/db-core` compatible database instance and returns a `ValtheraCRDT` instance.

### `ValtheraCRDT`

The `ValtheraCRDT` interface extends the `ValtheraCompatible` interface and adds the following methods:

- `rebuild(collection: string): Promise<void>`: Rebuilds a collection from its operation log.
- `sync(other: ValtheraCRDT, collection: string, rebuild?: boolean): Promise<void>`: Syncs a collection from another `ValtheraCRDT` instance.
- `makeSnapshot(collection: string): Promise<void>`: Creates a snapshot of a collection, effectively replacing the operation log with the current state of the data.

### `reverseSync(my: ValtheraCRDT, other: ValtheraCRDT, collection: string)`

Sync a collection from `my` to `other`.

## License

This project is licensed under the MIT License.
