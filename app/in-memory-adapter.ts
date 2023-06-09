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

  async get(path) {
    if (path === "") {
      return Object.keys(this.content);
    }

    const content = get(this.content, pathReplace(path));

    return content !== undefined
      ? Promise.resolve(content)
      : Promise.reject(notFound);
  }

  async post(path, data) {
    set(this.content, pathReplace(path), data);
    return get(this.content, pathReplace(path));
  }

  async put(path, data) {
    set(this.content, pathReplace(path), data);
    return get(this.content, pathReplace(path));
  }

  async patch(path, data) {
    const value = get(this.content, pathReplace(path));

    if (value && typeof value === "object") {
      set(this.content, pathReplace(path), merge(value, data));
    } else {
      set(this.content, pathReplace(path), data);
    }

    return get(this.content, pathReplace(path));
  }

  async delete(path) {
    set(this.content, pathReplace(path), undefined);

    return "";
  }
}
