import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Adapter } from './adapter.js';
import { InMemoryAdapter } from './in-memory-adapter.js';

export class FileAdapter extends Adapter {
  constructor(private dataFolder: string = process.env.FILE_PATH) {
    super();
  }

  protected deleteItem(...args): Promise<boolean> {
    return this.delegate('deleteItem', args);
  }

  protected deleteKind(...args): Promise<boolean> {
    return this.delegate('deleteKind', args);
  }

  protected async deleteStore(...args): Promise<boolean> {
    const filePath = this.getFilePath(args[0]);
    unlinkSync(filePath);
    return true;
  }

  protected getItem(...args): Promise<any> {
    return this.delegate('getItem', args);
  }

  protected getKind(...args): Promise<any[]> {
    return this.delegate('getKind', args);
  }

  protected getStore(...args): Promise<string[]> {
    return this.delegate('getStore', args);
  }

  protected writeItem(...args): Promise<void> {
    return this.delegate('writeItem', args);
  }

  protected writeStore(...args): Promise<void> {
    return this.delegate('writeStore', args);
  }

  protected async delegate(method: string, args) {
    const [hash] = args;
    const adapter = this.readContent(hash);
    const result = await adapter[method](...args);

    if (!method.startsWith('get')) {
      this.writeContent(hash, adapter.content);
    }

    return result;
  }

  protected writeContent(hash: string, content: any) {
    const filePath = this.getFilePath(hash);
    writeFileSync(filePath, JSON.stringify(content));
  }

  protected readContent(hash: string) {
    const filePath = this.getFilePath(hash);
    let content = {};

    if (existsSync(filePath)) {
      content = JSON.parse(readFileSync(filePath, 'utf8'));
    }

    return new InMemoryAdapter(content);
  }

  protected getFilePath(hash: string) {
    return join(this.dataFolder, hash + '.json');
  }
}
