import { randomUUID } from 'crypto';
import { Adapter } from './adapter.js';

export class InMemoryAdapter extends Adapter {
  constructor(public content = {}) {
    super();
  }

  protected async getItem(hash: string, kind: string, rest: string[]) {
    const content = this.content[hash]?.[kind];
    return content[rest[0]];
  }

  protected async getKind(hash: string, kind: string) {
    return Object.values(this.content[hash]?.[kind] || {});
  }

  protected async getStore(hash: string) {
    return Object.keys(this.content[hash] || {});
  }

  protected async writeItem(hash: any, kind: any, rest: any, data: any) {
    if (!this.content[hash]) {
      this.content[hash] = {};
    }

    if (!this.content[hash][kind]) {
      this.content[hash][kind] = {};
    }

    const content = this.content[hash][kind];
    const id = rest[0] || randomUUID();
    content[id] = data;
  }

  protected async writeStore(hash: any, data: any) {
    if (!this.content[hash]) {
      this.content[hash] = {};
    }

    Object.assign(this.content[hash], data);
  }

  protected async deleteItem(hash: string, kind: string, rest: string[]) {
    return delete this.content[hash]?.[kind][rest[0]];
  }

  protected async deleteKind(hash: string, kind: string) {
    return delete this.content[hash]?.[kind];
  }

  protected async deleteStore(hash: string) {
    return delete this.content[hash];
  }
}
