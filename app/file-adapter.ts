import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, createHash } from 'crypto'
import { Adapter } from "./adapter.js";
import { InMemoryAdapter } from "./in-memory-adapter.js";
import { splitHashAndPath } from "./common.js";

export class FileAdapter implements Adapter {
  constructor(private dataFolder: string) {}

  protected writeContent(hash, storage) {
    writeFileSync(join(this.dataFolder, hash), JSON.stringify(storage));
  }

  private createInMemoryAdapter(hash) {
    const filePath = join(this.dataFolder, hash);
    let content = {};

    if (existsSync(filePath)) {
      content = JSON.parse(readFileSync(filePath, "utf8"));
    }

    return new InMemoryAdapter(content);
  }

  get(key: string) {
    const { hash, path } = splitHashAndPath(key);
    const buffer = this.createInMemoryAdapter(hash);

    return buffer.get(path);
  }

  patch(key, data) {
    const { hash, path } = splitHashAndPath(key);
    const buffer = this.createInMemoryAdapter(hash);

    const output = buffer.patch(path, data);
    this.writeContent(hash, buffer.content);
    return output;
  }

  post(key, data) {
    const { hash, path } = splitHashAndPath(key);
    const uid = createHash('shas256').update(randomBytes(16)).digest('hex');
    const buffer = this.createInMemoryAdapter(hash);

    data = { ...data, uid };

    const output = buffer.post(path + '/' + uid, data);
    this.writeContent(hash, buffer.content);
    return output;
  }

  put(key, data) {
    const { hash, path } = splitHashAndPath(key);
    const [_, uid] = path.split('/');

    if (!uid) {
      return Promise.reject(new Error('BAD_REQUEST'));
    }

    const buffer = this.createInMemoryAdapter(hash);

    const output = buffer.put(path, data);
    this.writeContent(hash, buffer.content);
    return output;
  }

  delete(key) {
    const { hash, path } = splitHashAndPath(key);
    const buffer = this.createInMemoryAdapter(hash);

    const output = buffer.delete(path);
    this.writeContent(hash, buffer.content);
    return output;
  }
}
