import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import apiRoutes from './routes.js';
import { LOG } from './log.js';

export default function start(port: number) {
  const readme = readFileSync(join(process.cwd(), 'README.md')).toString('utf8');

  const esModule = {
    headers: {
      'Cache-Control': 'max-age=604800',
      'Content-Type': 'text/javascript; charset=utf-8',
    },
    content: readFileSync(join(process.cwd(), 'assets', 'store-esm.mjs'), 'utf8'),
  };

  const index = readFileSync(join(process.cwd(), 'assets', 'index.html')).toString('utf8').replace('%content%', readme);
  const app = express();

  app.use(bodyParser.json({ strict: false }));
  app.use(cors());
  app.get('/store.js', (req, res) =>
    res.set(esModule.headers).send(esModule.content.replace('__API_URL__', req.get('x-forwarded-for'))),
  );
  app.get('/store.mjs', (req, res) =>
    res.set(esModule.headers).send(esModule.content.replace('__API_URL__', req.get('x-forwarded-for'))),
  );
  app.get('/', (_, res) => res.send(index));
  app.get('/favicon.ico', (_, res) => res.status(404).send(null));
  app.use(apiRoutes);
  app.use((_, res) => res.status(404).send('Not found'));

  const server = app.listen(port);
  LOG(`Started at port ${port}`);

  return { app, server };
}

const port = process.env.PORT;
if (port) {
  start(Number(port));
}
