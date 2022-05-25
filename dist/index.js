var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  usePersist: () => usePersist
});
module.exports = __toCommonJS(src_exports);
var import_crypto_js = require("crypto-js");
var stateEncrypt = (state, key) => {
  return key ? import_crypto_js.AES.encrypt(JSON.stringify(state), key).toString() : JSON.stringify(state);
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
      const bytes = import_crypto_js.AES.decrypt(oldState, encryptionKey);
      const originalText = bytes.toString(import_crypto_js.enc.Utf8);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  usePersist
});
