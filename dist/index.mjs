// src/index.ts
import { AES, enc } from "crypto-js";
var stateEncrypt = (state, key) => {
  return key ? AES.encrypt(JSON.stringify(state), key).toString() : JSON.stringify(state);
};
var storageSet = (store, storage, encryptionKey, keys) => {
  if (!keys) {
    const state = stateEncrypt(store.$state, encryptionKey);
    storage.setItem(store.$id, state);
  } else {
    const state = {};
    keys.forEach((key) => {
      const value = store.$state[key];
      if (value !== void 0 && value !== null) {
        state[key] = store.$state[key];
      } else {
        console.warn("Persist key not found", key, store.$id);
      }
    });
    storage.setItem(store.$id, stateEncrypt(state, encryptionKey));
  }
};
var storageSync = (store, storage, oldState, encryptionKey, keys) => {
  if (oldState) {
    let stateObj;
    if (encryptionKey) {
      const bytes = AES.decrypt(oldState, encryptionKey);
      const originalText = bytes.toString(enc.Utf8);
      stateObj = JSON.parse(originalText);
    } else {
      stateObj = JSON.parse(oldState);
    }
    if (!keys) {
      store.$patch(stateObj);
    } else {
      keys.forEach((key) => {
        store.$patch((state) => {
          if ((state == null ? void 0 : state[key]) !== void 0 && (state == null ? void 0 : state[key]) !== null) {
            state[key] = stateObj[key];
          } else {
            console.warn(`${store.$id} not found key ${key}`);
          }
        });
      });
    }
  } else {
    storageSet(store, storage, encryptionKey, keys);
  }
};
function usePersist({ store, options }) {
  var _a, _b, _c, _d, _e;
  if ((_a = options.persist) == null ? void 0 : _a.enabled) {
    if (options.persist.keys && !Array.isArray(options.persist.keys)) {
      console.warn("Persist keys is String[]", store.$id);
    }
    const keys = (_b = options.persist) == null ? void 0 : _b.keys;
    const storage = ((_c = options.persist) == null ? void 0 : _c.storage) || localStorage;
    const encryptionKey = (_d = options.persist) == null ? void 0 : _d.encryptionKey;
    try {
      const oldState = storage.getItem(store.$id);
      storageSync(store, storage, oldState, encryptionKey, keys);
    } catch (error) {
      console.error("Persist error", error);
    }
    store.$subscribe(() => {
      console.log("Persist update", store.$state);
      storageSet(store, storage, encryptionKey, keys);
    }, {
      detached: ((_e = options.persist) == null ? void 0 : _e.detached) || true,
      deep: true
    });
  } else {
    console.warn("Persistence is used but persistent storage is not enabled, please check the configuration", store.$id);
  }
}
export {
  usePersist
};
