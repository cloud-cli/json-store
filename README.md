# JSON store REST API

## How to run

```bash
npm i && npm run build && npm start
```

## Using as an ESM Module

```js
import { Store } from 'https://server-address.io/store.js';

// create a store on server
const storeId = await Store.create();

// consume a store
const store = Store.get('__your_store_id__');
const users = await store.getResource('users');

// add resource
await users.add({ uid: '123', name: 'Joe' });

// remove it
await users.remove('123');

// get one
await users.get('123');

// list all
await users.list();
```

## As an API

Create a database:

`curl 'https://server-address.io/new'`

```json
{
  "id": "cdc0cafc15b857a2a61d292c0a30359091f57c9bc430f0785d0ed564f0b1fb9b"
}
```

### PUT

The following command will create a user in `/user/123`:

```bash
curl -XPOST -H "Content-type: application/json" -d '{ "name": "John Doe" }' 'https://server-address.io/cdc0cafc15b857a2a61d292c0a30359091f57c9bc430f0785d0ed564f0b1fb9b/user/123'
```

### GET

The following command will retrieve the user we created earlier:

```bash
curl 'https://server-address.io/cdc0cafc15b857a2a61d292c0a30359091f57c9bc430f0785d0ed564f0b1fb9b/user/123'
```

### DELETE

The following command will delete the user:

```bash
curl -XDELETE 'https://server-address.io/cdc0cafc15b857a2a61d292c0a30359091f57c9bc430f0785d0ed564f0b1fb9b/user/123'
```

## Env Variables

| Variable        | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| PORT            | http port where the service runs                                     |
| STORAGE         | Type of storage to use. "memory", "file", "sqlite"                   |
| FILE_PATH       | /path/to/folder where files will be stored if 'file' storage is used |
| SQLITE_PATH     | Path to db file if 'sqlite' storage is used                          |
| FIREBASE_CONFIG | JSON config for Firebase if 'firebase' storage is used               |
| DEBUG           | Set to any truthy value to enable debug logging                      |
