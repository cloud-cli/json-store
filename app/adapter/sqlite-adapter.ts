import { randomUUID } from 'crypto';
import { Adapter } from './adapter.js';
import { Model, Property, Query, Resource, SQLiteDriver } from '@cloud-cli/store';
import * as SQLite from 'better-sqlite3';

@Model('entry')
class Entry extends Resource {
  @Property(String) store: string;
  @Property(String) kind: string;
  @Property(String) documentId: number;
  @Property(Object) content: any;
}

export class SQLiteAdapter extends Adapter {
  protected async deleteItem(hash: string, kind: string, path: string[]): Promise<boolean> {
    const [id] = path;
    const result = this.db
      .prepare('DELETE from entry WHERE store = ? AND kind = ? AND documentId = ?')
      .run([hash, kind, id]);

    return result.changes > 0;
  }

  protected async deleteKind(hash: string, kind: string): Promise<boolean> {
    const result = this.db.prepare('DELETE from entry WHERE store = ? AND kind = ?').run([hash, kind]);
    return result.changes > 0;
  }

  protected async deleteStore(hash: string): Promise<boolean> {
    const result = this.db.prepare('DELETE from entry WHERE store = ?').run([hash]);
    return result.changes > 0;
  }

  protected async getItem(hash: string, kind: string, rest: string[]): Promise<any> {
    const [id] = rest;
    const found = await Resource.find(
      Entry,
      new Query<Entry>().where('documentId').is(id).where('kind').is(kind).where('store').is(hash),
    );

    if (found?.length) {
      return found[0];
    }

    return null;
  }

  protected getKind(hash: string, kind: string) {
    console.log('get store', hash);
    return Resource.find(Entry, new Query<Entry>().where('kind').is(kind).where('store').is(hash));
  }

  protected async getStore(hash: string) {
    console.log('get store', hash);
    const statement = this.db.prepare('SELECT DISTINCT kind AS resource from entry WHERE store = ?');
    const list = statement.all([hash]);
    console.log(list);
    return list.map((n: any) => String(n.resource));
  }

  protected async writeItem(hash: any, kind: any, rest: any, content: any): Promise<void> {
    const documentId = rest.length ? rest[0] : randomUUID();
    const entry = new Entry({ hash, kind, documentId, content });
    await entry.save();
  }

  protected async writeStore(hash: any, data: any): Promise<void> {
    const entries = Object.entries(data);

    for (const entry of entries) {
      const [kind, content] = entry;
      const documentId = randomUUID();
      const next = new Entry({ hash, kind, documentId, content });
      await next.save();
    }
  }

  protected db: SQLite.Database;
  constructor(dbPath: string = process.env.SQLITE_PATH) {
    super();
    const driver = new SQLiteDriver(dbPath);
    this.db = driver.db;

    Resource.use(driver);
    Resource.create(Entry);
  }
}
