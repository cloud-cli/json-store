import { get, merge } from "lodash-es";
import { Adapter } from "./adapter.js";
import { set } from "./common.js";

const notFound = new Error("NOT_FOUND");
const pathReplace = (path: string) =>
  path
    .split("/")
    .join(".")
    .replace(/^\.|\.$/g, "");

export class InMemoryAdapter implements Adapter {
  constructor(public content = {}) {}

  get(path) {
    if (path === "") {
      return this.content;
    }

    const content = get(this.content, pathReplace(path));

    return content !== undefined
      ? Promise.resolve(content)
      : Promise.reject(notFound);
  }

  post(path, data) {
    set(this.content, pathReplace(path), data);
    return Promise.resolve("");
  }

  put(path, data) {
    set(this.content, pathReplace(path), data);
    return Promise.resolve("");
  }

  patch(path, data) {
    const value = get(this.content, pathReplace(path), data);

    if (value && typeof value === "object") {
      set(this.content, pathReplace(path), merge(value, data));
    } else {
      set(this.content, pathReplace(path), data);
    }

    return Promise.resolve("");
  }

  delete(path) {
    set(this.content, pathReplace(path), undefined);
    return Promise.resolve("");
  }
}
