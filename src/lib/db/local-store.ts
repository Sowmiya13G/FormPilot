import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function generateObjectId(): string {
  return crypto.randomBytes(12).toString('hex');
}

function getNestedValue(obj: unknown, keyPath: string): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== 'object') return undefined;

  // Direct key check first
  if (keyPath in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[keyPath];
  }

  // Handle dot notation e.g. 'data.employeeName'
  const parts = keyPath.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matchFilter(doc: Record<string, any>, filter?: Record<string, any>): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some((subFilter) => matchFilter(doc, subFilter));
      if (!orMatched) return false;
      continue;
    }

    if (key === '$and' && Array.isArray(val)) {
      const andMatched = val.every((subFilter) => matchFilter(doc, subFilter));
      if (!andMatched) return false;
      continue;
    }

    const docVal = getNestedValue(doc, key);

    // Operator object: $regex, $ne, $in, $exists, etc.
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp) && !(val instanceof Date)) {
      const valObj = val as Record<string, any>;
      if ('$regex' in valObj) {
        const regex = new RegExp(valObj.$regex, valObj.$options || '');
        if (!regex.test(String(docVal ?? ''))) return false;
        continue;
      }
      if ('$ne' in valObj) {
        if (docVal === valObj.$ne) return false;
        continue;
      }
      if ('$in' in valObj && Array.isArray(valObj.$in)) {
        if (!valObj.$in.includes(docVal)) return false;
        continue;
      }
      if ('$exists' in valObj) {
        const exists = docVal !== undefined && docVal !== null;
        if (Boolean(valObj.$exists) !== exists) return false;
        continue;
      }
    }

    if (val instanceof RegExp) {
      if (!val.test(String(docVal ?? ''))) return false;
      continue;
    }

    // ID comparison (supports ObjectId, string, number)
    if (key === '_id' || key === 'id') {
      const docIdStr = String(doc._id || doc.id || '');
      const targetIdStr = String(val?._id || val?.id || val || '');
      if (docIdStr !== targetIdStr) return false;
      continue;
    }

    // Direct equality
    if (docVal !== val) {
      // Loose comparison for booleans vs string representations
      if (typeof val === 'boolean' && (docVal === String(val) || Boolean(docVal) === val)) {
        continue;
      }
      if (val instanceof Date && docVal instanceof Date && val.getTime() === docVal.getTime()) {
        continue;
      }
      if (val instanceof Date && typeof docVal === 'string' && val.toISOString() === new Date(docVal).toISOString()) {
        continue;
      }
      return false;
    }
  }

  return true;
}

export class LocalQuery<T> {
  private results: T[];
  private sortObj?: Record<string, number>;
  private skipCount: number = 0;
  private limitCount?: number;
  private isSingle: boolean;

  constructor(results: T[], isSingle: boolean = false) {
    this.results = [...results];
    this.isSingle = isSingle;
  }

  sort(criteria: Record<string, number>): this {
    this.sortObj = criteria;
    return this;
  }

  skip(n: number): this {
    this.skipCount = Math.max(0, n);
    return this;
  }

  limit(n: number): this {
    this.limitCount = Math.max(0, n);
    return this;
  }

  lean(): this {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private resolve(): any {
    let res = [...this.results];

    if (this.sortObj) {
      const entries = Object.entries(this.sortObj);
      res.sort((a, b) => {
        for (const [field, direction] of entries) {
          const valA = getNestedValue(a, field);
          const valB = getNestedValue(b, field);
          if (valA === valB) continue;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (valA < valB) return direction === 1 ? -1 : 1;
          if (valA > valB) return direction === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    if (this.skipCount > 0) {
      res = res.slice(this.skipCount);
    }

    if (this.limitCount !== undefined) {
      res = res.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return res.length > 0 ? res[0] : null;
    }

    return res;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async exec(): Promise<any> {
    return this.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.resolve()).then(onfulfilled, onrejected);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __localDataStoreCache__: Record<string, any[]> | undefined;
}

export class LocalStore<T extends Record<string, any> = Record<string, any>> {
  public collectionName: string;
  private filePath: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Safe ignore
      }
    }
    this.filePath = path.join(dataDir, `${collectionName}.json`);
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!global.__localDataStoreCache__) {
      global.__localDataStoreCache__ = {};
    }

    if (!global.__localDataStoreCache__[this.collectionName]) {
      if (fs.existsSync(this.filePath)) {
        try {
          const raw = fs.readFileSync(this.filePath, 'utf-8');
          global.__localDataStoreCache__[this.collectionName] = JSON.parse(raw);
        } catch {
          global.__localDataStoreCache__[this.collectionName] = [];
        }
      } else {
        global.__localDataStoreCache__[this.collectionName] = [];
        this.persist();
      }
    }
  }

  private getItems(): T[] {
    this.ensureInitialized();
    return (global.__localDataStoreCache__![this.collectionName] || []) as T[];
  }

  private persist() {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.getItems(), null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error(`Failed to persist local store for ${this.collectionName}:`, err);
    }
  }

  public wrapDoc(doc: T): T {
    if (!doc) return doc;
    const self = this;
    const wrapped = { ...doc };

    Object.defineProperty(wrapped, 'save', {
      enumerable: false,
      configurable: true,
      value: async function () {
        this.updatedAt = new Date();
        const items = self.getItems();
        const index = items.findIndex((item) => String(item._id) === String(this._id));
        if (index >= 0) {
          items[index] = { ...this };
        } else {
          items.push({ ...this });
        }
        self.persist();
        return self.wrapDoc(this);
      },
    });

    Object.defineProperty(wrapped, 'toObject', {
      enumerable: false,
      configurable: true,
      value: function () {
        return { ...this };
      },
    });

    Object.defineProperty(wrapped, 'toJSON', {
      enumerable: false,
      configurable: true,
      value: function () {
        return { ...this };
      },
    });

    return wrapped;
  }

  // --- Mongoose-Compatible Methods ---

  find(filter?: Record<string, any>): LocalQuery<T> {
    const items = this.getItems().filter((item) => matchFilter(item, filter));
    const wrappedItems = items.map((i) => this.wrapDoc(i));
    return new LocalQuery<T>(wrappedItems, false);
  }

  findOne(filter?: Record<string, any>): LocalQuery<T> {
    const items = this.getItems().filter((item) => matchFilter(item, filter));
    const wrappedItems = items.map((i) => this.wrapDoc(i));
    return new LocalQuery<T>(wrappedItems, true);
  }

  findById(id: string | { toString: () => string }): LocalQuery<T> {
    const idStr = String(id);
    const items = this.getItems().filter((item) => String(item._id) === idStr);
    const wrappedItems = items.map((i) => this.wrapDoc(i));
    return new LocalQuery<T>(wrappedItems, true);
  }

  async create(data: Partial<T> | Partial<T>[]): Promise<any> {
    const items = this.getItems();
    const now = new Date();

    if (Array.isArray(data)) {
      const createdList: T[] = [];
      for (const item of data) {
        const doc = {
          _id: (item as any)._id ? String((item as any)._id) : generateObjectId(),
          createdAt: now,
          updatedAt: now,
          ...item,
        } as unknown as T;
        items.push(doc);
        createdList.push(this.wrapDoc(doc));
      }
      this.persist();
      return createdList;
    }

    const doc = {
      _id: (data as any)._id ? String((data as any)._id) : generateObjectId(),
      createdAt: now,
      updatedAt: now,
      ...data,
    } as unknown as T;

    items.push(doc);
    this.persist();
    return this.wrapDoc(doc);
  }

  async findByIdAndUpdate(
    id: string | { toString: () => string },
    update: Record<string, any>,
    options?: { new?: boolean; upsert?: boolean }
  ): Promise<T | null> {
    const idStr = String(id);
    const items = this.getItems();
    const index = items.findIndex((item) => String(item._id) === idStr);

    if (index === -1) {
      if (options?.upsert) {
        return this.create({ _id: idStr, ...(update.$set || update) });
      }
      return null;
    }

    const existing = items[index];
    const updates = update.$set ? { ...update.$set } : { ...update };
    delete updates.$set;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    } as unknown as T;

    items[index] = updated;
    this.persist();

    return this.wrapDoc(options?.new !== false ? updated : existing);
  }

  async findOneAndUpdate(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { new?: boolean; upsert?: boolean }
  ): Promise<T | null> {
    const items = this.getItems();
    const index = items.findIndex((item) => matchFilter(item, filter));

    if (index === -1) {
      if (options?.upsert) {
        const payload: Record<string, any> = { ...filter };
        const updates = update.$set ? { ...update.$set } : { ...update };
        delete updates.$set;
        Object.assign(payload, updates);
        return this.create(payload as Partial<T>);
      }
      return null;
    }

    const existing = items[index];
    const updates = update.$set ? { ...update.$set } : { ...update };
    delete updates.$set;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    } as T;

    items[index] = updated;
    this.persist();

    return this.wrapDoc(options?.new !== false ? updated : existing);
  }

  async updateOne(
    filter: Record<string, any>,
    update: Record<string, any>
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const result = await this.findOneAndUpdate(filter, update);
    return {
      acknowledged: true,
      modifiedCount: result ? 1 : 0,
    };
  }

  async findByIdAndDelete(id: string | { toString: () => string }): Promise<T | null> {
    const idStr = String(id);
    const items = this.getItems();
    const index = items.findIndex((item) => String(item._id) === idStr);

    if (index === -1) return null;

    const [deleted] = items.splice(index, 1);
    this.persist();
    return this.wrapDoc(deleted);
  }

  async findOneAndDelete(filter: Record<string, any>): Promise<T | null> {
    const items = this.getItems();
    const index = items.findIndex((item) => matchFilter(item, filter));

    if (index === -1) return null;

    const [deleted] = items.splice(index, 1);
    this.persist();
    return this.wrapDoc(deleted);
  }

  async countDocuments(filter?: Record<string, any>): Promise<number> {
    if (!filter || Object.keys(filter).length === 0) {
      return this.getItems().length;
    }
    return this.getItems().filter((item) => matchFilter(item, filter)).length;
  }

  async distinct(field: string, filter?: Record<string, any>): Promise<any[]> {
    const items = this.getItems().filter((item) => matchFilter(item, filter));
    const set = new Set<any>();
    for (const item of items) {
      const val = getNestedValue(item, field);
      if (val !== undefined && val !== null) {
        set.add(val);
      }
    }
    return Array.from(set);
  }
}

const storeInstances: Record<string, LocalStore<any>> = {};

export function getLocalStore<T extends Record<string, any> = Record<string, any>>(
  collectionName: string
): LocalStore<T> {
  if (!storeInstances[collectionName]) {
    storeInstances[collectionName] = new LocalStore<T>(collectionName);
  }
  return storeInstances[collectionName] as LocalStore<T>;
}

