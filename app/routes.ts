import * as express from 'express';
import * as crypto from 'crypto';
import * as Path from 'path';
import { InMemoryAdapter } from './in-memory-adapter';
import { FileAdapter } from './file-adapter';
import { Adapter } from './adapter';
import { LOG } from './common';
import { FirebaseAdapter } from './firebase-adapter';

const storageAdapter = process.env.STORAGE || 'memory';
let adapter: Adapter;

LOG('Using %s adapter', storageAdapter);

switch (storageAdapter) {
  case 'memory':
    adapter = new InMemoryAdapter();
    break;

  case 'file':
    adapter = new FileAdapter(Path.join(__dirname, '..', 'data'));
    break;

  case 'firebase':
    adapter = new FirebaseAdapter(JSON.parse(process.env.FIREBASE_CONFIG));
    break;
}

function checkContentType(req, res, next) {
  if (!req.is('application/json')) {
    return res.status(400).send('Invalid content type');
  }

  next();
}

const router = express.Router();

router.get('/new', (_, res) => {
  const seed = crypto.randomBytes(64);
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return res.send({ id: hash });
});

router.get(/^\/[0-9a-f]{64}/, (req, res) => {
  LOG('GET', req.path);
  adapter
    .get(req.path)
    .then(result => res.status(200).send(result))
    .catch((error) => res.status(error.message === 'NOT_FOUND' ? 404 : 400).send(''))
});

router.post(/^\/[0-9a-f]{64}/, checkContentType, (req, res) => {
  LOG('POST', req.path, req.body);
  adapter
    .post(req.path, req.body)
    .then(() => res.status(201).send(''))
    .catch(() => res.status(500).send(''))
})

router.put(/^\/[0-9a-f]{64}/, checkContentType, (req, res) => {
  LOG('PUT', req.path, req.body);
  adapter
    .put(req.path, req.body)
    .then(() => res.status(200).send(''))
    .catch(() => res.status(500).send(''))
});

router.patch(/^\/[0-9a-f]{64}/, checkContentType, (req, res) => {
  LOG('PATCH', req.path, req.body);
  adapter
    .patch(req.path, req.body)
    .then(() => res.status(200).send(''))
    .catch(() => res.status(500).send(''))
});

router.delete(/^\/[0-9a-z]{64}/, (req, res) => {
  LOG('DELETE', req.path);
  adapter
    .delete(req.path)
    .then(() => res.status(200).send(''))
    .catch(() => res.status(500).send(''))
});

export default router;
