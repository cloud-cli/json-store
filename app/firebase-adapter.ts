import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase, ref, get, set, update, remove } from 'firebase/database';
import { Adapter } from './adapter.js';

export class FirebaseAdapter implements Adapter {
  app: FirebaseApp;
  firebase: Database;

  constructor(config: object) {
    if (!config) {
      throw new Error('Config is missing');
    }

    this.app = initializeApp(config);
    this.firebase = getDatabase(this.app);
  }

  async get(path: string) {
    const snapshot = await get(ref(this.firebase, path));
    return snapshot.val();
  }

  post(path: string, data: any) {
    return set(ref(this.firebase, path), data);
  }

  put(path: string, data: any) {
    return update(ref(this.firebase), {
      [path]: data,
    });
  }

  delete(path: string) {
    return remove(ref(this.firebase, path));
  }

  patch() {
    return Promise.reject(null);
  }
}
