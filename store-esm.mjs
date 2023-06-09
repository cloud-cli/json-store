const baseUrl = "__API_URL__";
const fetchOptions = { mode: "cors" };
const fetchHeaders = { headers: { "content-type": "application/json" } };
const asJson = (x) => x.json();
const idIsMissingError = new Error("Id is missing");

export class Store {
  /**
   * Creates a JSON store
   * @returns {string} new store ID
   */
  static create() {
    return fetch(new URL("/new", baseUrl), fetchOptions)
      .then(asJson)
      .then((store) => store.id);
  }

  static get(id) {
    return new Store(id);
  }

  constructor(id) {
    if (!id) {
      throw idIsMissingError;
    }

    this.id = id;
  }

  /**
   *
   * @param {string} name
   * @returns {Resource}
   */
  getResource(name) {
    return new Resource(name);
  }
}

class Resource {
  constructor(name) {
    if (!name) {
      throw new Error("Resource name is missing");
    }

    this.name = name;
    this.resourceUrl = new URL(`/${this.name}/`, baseUrl);
  }

  /**
   * List all content for this resource
   */
  list() {
    return fetch(this.resourceUrl, fetchOptions).then(asJson);
  }

  /**
   * Get one item by ID
   * @param {string} [id] resource ID
   */
  get(id = "") {
    if (id) {
      const url = new URL(id, this.resourceUrl);
      return fetch(url, fetchOptions).then(asJson);
    }

    throw idIsMissingError;
  }

  /**
   * Remove one item by ID
   * @param {string} [id] resource ID
   */
  remove(id = "") {
    if (id) {
      const url = new URL(id, this.resourceUrl);
      return fetch(url, { ...fetchOptions, method: "DELETE" }).then(asJson);
    }

    throw idIsMissingError;
  }

  /**
   * Add one item
   * @param {Object} payload resource to add
   * @param {string} [uid] unique ID of this resource. If not provided, one will be generated
   */
  add(payload = {}) {
    return fetch(this.resourceUrl, {
      ...fetchOptions,
      ...fetchHeaders,
      method: "POST",
      body: JSON.stringify(payload),
    }).then(toJson);
  }
}
