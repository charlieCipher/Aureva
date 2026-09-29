export class VaultSession {
  #key = null;
  #generation = 0;
  #timer = null;
  #listeners = new Set();
  #metadata = new Map();
  #urls = new Set();
  constructor(timeout = 300000) {
    this.timeout = timeout;
  }
  get unlocked() {
    return this.#key !== null;
  }
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
  unlock(key) {
    this.lock();
    this.#key = key;
    this.touch();
  }
  touch() {
    if (!this.unlocked) return;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.lock(), this.timeout);
  }
  configureTimeout(ms) {
    if (![60000, 300000, 600000].includes(ms))
      throw new Error("Invalid lock timeout.");
    this.timeout = ms;
    this.touch();
  }
  async run(operation) {
    if (!this.#key) throw new Error("Unlock your vault to continue.");
    const generation = this.#generation;
    const assertActive = () => {
      if (generation !== this.#generation || !this.#key)
        throw new Error("Your vault locked. Unlock it and try again.");
    };
    const result = await operation(this.#key, assertActive);
    if (generation !== this.#generation || !this.#key) {
      if (result?.bytes instanceof Uint8Array) result.bytes.fill(0);
      throw new Error("Your vault locked. Unlock it and try again.");
    }
    return result;
  }
  cache(id, metadata) {
    if (!this.#key) throw new Error("Vault locked.");
    this.#metadata.set(id, metadata);
  }
  search(query) {
    if (!this.#key) return [];
    const q = query.toLowerCase();
    return [...this.#metadata.entries()]
      .filter(([, m]) =>
        String(m.title || "")
          .toLowerCase()
          .includes(q),
      )
      .map(([id]) => id);
  }
  trackURL(url) {
    if (!this.unlocked) {
      URL.revokeObjectURL(url);
      return;
    }
    this.#urls.add(url);
  }
  lock() {
    clearTimeout(this.#timer);
    this.#timer = null;
    this.#generation++;
    this.#key = null;
    this.#metadata.clear();
    for (const url of this.#urls) URL.revokeObjectURL(url);
    this.#urls.clear();
    for (const fn of this.#listeners) fn();
  }
  dispose() {
    this.lock();
    this.#listeners.clear();
  }
}
