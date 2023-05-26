import * as FS from 'node:fs';
import * as Path from 'node:path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import apiRoutes from './routes.js';
import { LOG } from './common.js';

const readme = FS.readFileSync(Path.join(process.cwd(), 'README.md')).toString('utf8');
const index = FS.readFileSync(Path.join(process.cwd(), 'index.html'))
  .toString('utf8')
  .replace('%content%', readme);

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json({ strict: false }));
app.use(cors());
app.get('/', (_, res) => res.send(index));
app.get('/favicon.ico', (_, res) => res.status(404).send(null));
app.use(apiRoutes);
app.use((_, res) => res.status(404).send('Not found'));

app.listen(port);
LOG(`Started at port ${port}`);
