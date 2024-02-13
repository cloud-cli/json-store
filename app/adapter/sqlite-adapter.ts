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
  protected async deleteItem(store: string, kind: string, path: string[]): Promise<boolean> {
    const [id] = path;
    const result = this.db
      .prepare('DELETE from entry WHERE store = ? AND kind = ? AND documentId = ?')
      .run([store, kind, id]);

    return result.changes > 0;
  }

  protected async deleteKind(store: string, kind: string): Promise<boolean> {
    const result = this.db.prepare('DELETE from entry WHERE store = ? AND kind = ?').run([store, kind]);
    return result.changes > 0;
  }

  protected async deleteStore(store: string): Promise<boolean> {
    const result = this.db.prepare('DELETE from entry WHERE store = ?').run([store]);
    return result.changes > 0;
  }

  protected async getItem(store: string, kind: string, rest: string[]): Promise<any> {
    const [id] = rest;
    const found = await Resource.find(
      Entry,
      new Query<Entry>().where('documentId').is(id).where('kind').is(kind).where('store').is(store),
    );

    if (found?.length) {
      return found[0].content;
    }

    return null;
  }

  protected async getKind(store: string, kind: string) {
    const all = await Resource.find(Entry, new Query<Entry>().where('kind').is(kind).where('store').is(store));
    return all.map(item => item.content);
  }

  protected async getStore(store: string) {
    const statement = this.db.prepare('SELECT DISTINCT kind AS resource from entry WHERE store = ?');
    const list = statement.all([store]);
    return list.map((n: any) => String(n.resource));
  }

  protected async writeItem(store: string, kind: string, rest: string[], content: any): Promise<void> {
    const documentId = rest.length ? rest[0] : randomUUID();
    const entry = new Entry({ store, kind, documentId, content });
    await entry.save();
  }

  protected async writeStore(store: string, data: any): Promise<void> {
    const entries = Object.entries(data);

    for (const entry of entries) {
      const [kind, content] = entry;
      const documentId = randomUUID();
      const next = new Entry({ store, kind, documentId, content });
      await next.save();
    }
  }

  protected db: SQLite.Database;
  constructor(dbPath: string = process.env.SQLITE_PATH) {
    super();
    const driver = new SQLiteDriver(dbPath);
    this.db = driver.db;

    Resource.use(driver);
  }

  async init() {
    await Resource.create(Entry);
  }
}
