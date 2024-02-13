const notFound = new Error("NOT_FOUND");
import { LOG } from '../log.js';

export abstract class Adapter {
  async init() {}

  async write(path, data) {
    const [hash, kind, rest] = this.splitPath(path);
    LOG('write', hash, kind, rest);

    if (!hash) {
      throw notFound;
    }

    if (!kind) {
      return this.writeStore(hash, data);
    }

    this.writeItem(hash, kind, rest, data);
  }

  async read(path: string) {
    const [hash, kind, rest] = this.splitPath(path);
    LOG('read', hash, kind, rest);

    if (!hash) {
      throw notFound;
    }

    if (!kind) {
      return this.getStore(hash);
    }

    if (!rest.length) {
      const items = await this.getKind(hash, kind);

      if (items) {
        return items;
      }

      throw notFound;
    }

    const item = await this.getItem(hash, kind, rest);
    if (item) {
      return item;
    }

    throw notFound;
  }

  async remove(path: string) {
    const [hash, kind, rest] = this.splitPath(path);
    LOG('remove', hash, kind, rest);

    if (!kind) {
      return this.deleteStore(hash);
    }

    if (!rest.length) {
      return this.deleteKind(hash, kind);
    }

    return this.deleteItem(hash, kind, rest);
  }

  protected splitPath(path: string) {
    const [hash, kind, ...rest] = path.replace(/^\/|\/$/, "").split("/");
    return [hash, kind, rest.filter(Boolean)] as [string, string, string[]];
  }

  protected abstract deleteItem(
    hash: string,
    kind: string,
    path: string[]
  ): Promise<boolean>;
  protected abstract deleteKind(hash: string, kind: string): Promise<boolean>;
  protected abstract deleteStore(hash: string): Promise<boolean>;

  protected abstract getItem(
    hash: string,
    kind: string,
    rest: string[]
  ): Promise<any>;
  protected abstract getKind(hash: string, kind: string): Promise<any[]>;
  protected abstract getStore(hash: string): Promise<string[]>;

  protected abstract writeItem(
    hash: any,
    kind: any,
    rest: any,
    data: any
  ): Promise<void>;
  protected abstract writeStore(hash: any, data: any): Promise<void>;
}
