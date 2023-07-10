import express from 'express';
import { randomBytes, createHash } from 'crypto';
import { LOG } from './log.js';
import { Adapter } from './adapter/adapter.js';

const storageAdapter = process.env.STORAGE || 'memory';
let adapter: Adapter;

LOG('Using adapter:', storageAdapter);

async function start() {
  switch (storageAdapter) {
    case 'memory':
      const InMemoryAdapter = (await import('./adapter/in-memory-adapter.js')).InMemoryAdapter;
      adapter = new InMemoryAdapter();
      break;

    case 'file':
      const FileAdapter = (await import('./adapter/file-adapter.js')).FileAdapter;
      adapter = new FileAdapter();
      break;

    // case 'firebase':
    //   const FirebaseAdapter = (await import('./firebase-adapter.js')).FirebaseAdapter;
    //   adapter = new FirebaseAdapter(JSON.parse(process.env.FIREBASE_CONFIG));
    //   break;
    // case 'sqlite':
    //   const SQLiteAdapter = (await import('./sqlite-adapter.js')).SQLiteAdapter;
    //   adapter = new SQLiteAdapter();
    //   break;
  }
}

start();

function checkContentType(req, res, next) {
  if (!req.is('application/json')) {
    return res.status(400).send('Invalid content type');
  }

  next();
}

const router = express.Router();
const routeMatcher = /^\/[0-9a-f]{64}/;

router.get('/new', (_, res) => {
  const seed = randomBytes(64);
  const id = createHash('sha256').update(seed).digest('hex');

  return res.send({ id });
});

router.get(routeMatcher, async (req, res) => {
  LOG('GET', req.path);

  try {
    const result = await adapter.read(req.path);
    res.status(200).send(result);
  } catch (error) {
    LOG(error);
    res.status(error.message === 'NOT_FOUND' ? 404 : 400).send('');
  }
});

router.put(routeMatcher, checkContentType, async (req, res) => {
  LOG('PUT', req.path, req.body);

  try {
    await adapter.write(req.path, req.body);
    res.status(202).send('');
  } catch (error) {
    LOG(error);
    res.status(error.message === 'BAD_REQUEST' ? 400 : 500).send('');
  }
});

router.delete(routeMatcher, async (req, res) => {
  LOG('DELETE', req.path);
  try {
    await adapter.remove(req.path);
    res.status(204).send('');
  } catch (error) {
    LOG(error);
    res.status(500).send('');
  }
});

export default router;
