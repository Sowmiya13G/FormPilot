import { isLocalMode } from './config';
import { getLocalStore } from './local-store';

/**
 * Creates a transparent Proxy around a Mongoose Model.
 * In local data mode, calls are intercepted and executed against the local JSON file store.
 * When MongoDB is active, calls pass directly to the real Mongoose Model.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createModelProxy<T extends Record<string, any> = Record<string, any>>(
  collectionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mongooseModel: any
): any {
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (isLocalMode()) {
        const store = getLocalStore<T>(collectionName);
        if (typeof prop === 'string' && prop in store) {
          const val = (store as any)[prop];
          if (typeof val === 'function') {
            return val.bind(store);
          }
          return val;
        }
      }
      return Reflect.get(target, prop, receiver);
    },

    construct(target, argArray) {
      if (isLocalMode()) {
        const store = getLocalStore<T>(collectionName);
        const data = argArray[0] || {};
        const doc = {
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        return store.wrapDoc(doc as any);
      }
      return new target(...argArray);
    },
  });
}

