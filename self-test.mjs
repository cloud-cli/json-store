import test from 'node:test';
import assert from 'node:assert';
import start from './build/index.js';

let timeout = 0;

async function setup() {
  globalThis.API_URL = 'http://localhost:1234/';
  const md = await import('./assets/store-esm.mjs');
  const { Store } = md;

  process.env.SQLITE_PATH = './tmp/test.db';
  process.env.PORT = 1234;
  process.env.DEBUG = 1;
  const { server } = start(1234);

  timeout = setTimeout(() => server.close(), 30_000);
  return { Store, server };
}

test('Store', async () => {
  const { Store, server } = await setup();

  // create store id
  const storeId = await Store.create();
  assert(storeId !== undefined, 'store id defined');

  // get a store by id
  const store = Store.get(storeId);
  assert.deepEqual(await store.getResourceNames(), [], 'resource names not empty');

  // resource list starts empty
  const testResource = store.getResource('persons');
  assert.deepEqual(await testResource.list(), [], 'resource list not empty');

  const alice = { id: 1, name: 'Alice', age: 22 };
  const bob = { id: 2, name: 'Bob', age: 31 };

  // store two resources
  await testResource.set(1, alice);
  await testResource.set(2, bob);

  // resource kind is auto created
  assert.deepEqual(await store.getResourceNames(), ['persons'], 'resource names empty');

  // resources can be listed
  assert.deepEqual(await testResource.list(), [alice, bob], 'resources not stored correctly');

  // resource can be removed
  await testResource.remove(1);
  assert.deepEqual(await testResource.list(), [bob], 'resource not removed');

  // resource can be retrieved
  const found = await testResource.get(2);
  assert.deepEqual(found, bob, 'resource not found');

  // kind can be removed
  await testResource.removeAll();
  assert.deepEqual(await store.getResourceNames(), [], 'resource names empty after removal');

  // store can be removed
  const removed = await store.remove();
  assert.deepEqual(removed, true, 'store not removed');
  assert.deepEqual(await store.getResourceNames(), [], 'resource names not empty');

  server.close();
  clearTimeout(timeout);
});
