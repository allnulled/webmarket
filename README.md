# webmarket

Wrapper for IndexedDB.

## Installation

```sh
npm install --save @allnulled/webmarket
```

Then:

```html
<script src="node_modules/@allnulled/webmarket/webmarket.js"></script>
```

## Usage

```js
const wm = await Webmarket.open();
// @TODO: operations
```

## Operations

The `window.Wemarket` global class has some methods:

 - `static create(dbName)`: creates an instance.
    - Receives `String:dbName`, the name of the database.
    - Returns `Webmarket` type.
 - `static open(dbName)`: creates and initializes an instance.
    - Receives `String:dbName`, the name of the database.
    - Returns `Promise<Webmarket>` type.
 - `static init(dbName)`
    - Receives `String:dbName`, the name of the database.
    - Return `Promise<Webmarket>` type, and returns `wm.init()`.
 - `static listDatabases()`
    - Receives nothing.
    - Returns the list of names of databases found.
 - `constructor(dbName = "webmarket")`
    - Receives `String:dbName`, the name of the database.
    - Creates the object only. You still need to call to `wm.init()`.
 - `async init()`
    - Receives nothing. Uses the `this.dbName` set on the constructor.
    - Ensures the current store and returns an internal IDB object.
 - `async changeDatabase(dbName)`
    - Receives `String:dbName`, the name of the database.
    - Changes the name of the database, and calls `wm.init()` again.
 - `async select()`
    - Receives nothing. Filters are complicated in IDB.
    - Returns a list of all the items.
 - `async selectById(id)`
    - Receives `Integer:id`, the `id` of the row to select.
    - Returns the item by id, if found.
 - `async insertOne(data)`
    - Receives `Object:item`, the `item` to insert.
    - Inserts one item.
    - Returns the inserted `id`.
 - `async insertMany(items)`
    - Receives `Array<Object>:items`, the `items` to insert.
    - Inserts a list of items.
    - Returns the inserted `id`s in a list.
 - `async updateOne(id, data)`
    - Receives `Integer:id`, the `id` of the row to update.
    - Updates one item.
    - Returns the updated `id`.
 - `async deleteOne(id)`
    - Receives `Integer:id`, the `id` of the row to delete.
    - Deletes one item.
    - Returns nothing.

## How it better works?

Just remember this.

Databases are directories. Rows are files indexed by `id`.

There are no stores with webmarket, no schema versions, no schema modifications.

Only 1 directory and N files. Only 1 database and N registries.

### Steps

1. You `open` database and store. `wm = Webmarket.open(dbName)`
2. You operate the CRUD like so:
   1. `all = await wm.select()`
   1. `one = await wm.selectById(1)`
   1. `id = await wm.insertOne({})`
   1. `ids = await wm.insertMany([{}, {}, {}])`
   1. `id = await wm.updateOne(1, {})`
   1. `await wm.deleteOne(1)`

By default, you work on `"webmarket"` database, and `webstore` store.

The idea is to only alter the `database` name.

## Test

```js
// Creamos una instancia de Webmarket
const wm = await Webmarket.open("testDB");

// Insertamos un solo dato
const id = await wm.insertOne({ name: "Item 1", description: "First item" });
console.log(`Inserted item with ID: ${id}`);

// Insertamos varios datos
const ids = await wm.insertMany([
    { name: "Item 2", description: "Second item" },
    { name: "Item 3", description: "Third item" }
]);
console.log(`Inserted items with IDs: ${ids.join(", ")}`);

// Recuperamos todos los elementos
const items = await wm.select();
console.log("All items:", items);

// Actualizamos un elemento
await wm.updateOne(id, { name: "Updated Item 1", description: "Updated description" });
console.log("Updated item with ID:", id);

// Recuperamos el elemento actualizado
const updatedItem = await wm.selectById(id);
console.log("Updated item:", updatedItem);

// Eliminamos un elemento
await wm.deleteOne(id);
console.log("Deleted item with ID:", id);

// Recuperamos todos los elementos después de la eliminación
const remainingItems = await wm.select();
console.log("Remaining items:", remainingItems);
```