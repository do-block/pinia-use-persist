import {PiniaPluginContext, StateTree, PiniaCustomStateProperties} from 'pinia';

import {AES, enc} from 'crypto-js'

type Store = PiniaPluginContext['store'];

type CustomEncryption = {
  encrypt: (state: StateTree & PiniaCustomStateProperties) => string;
  decrypt: (state: string) => string;
};

type PersistOptions = {
  // Turn on the log function , feature under development ...
  log?: boolean;
  // 是否开启持久化存储
  enabled?: boolean;
  // 自定义名称
  key?: string;
  // A single store needs to store part of the key-value, the default is to store all
  cacheFields?: string[];
  // 自定义加密函数
  customEncryption?: CustomEncryption;
  // Using Storage Types, default is localStorage
  storage?: Storage;
  //  Encrypt key, if not passed then not encrypted
  encryptionKey?: string;
  // Whether to retain data after component destruction
  detached?: boolean;
};

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions;
  }
}

const stateEncrypt = (state: StateTree & PiniaCustomStateProperties, key?: string,) => {
  return key ? AES.encrypt(JSON.stringify(state), key).toString() : JSON.stringify(state);
}

const storageSet = (
  store: Store,
  storage: Storage,
  key: string,
  encryptionKey?: string,
  cacheFields?: string[],
  customEncryption?: CustomEncryption
) => {
  if (!cacheFields) {
    let state: string;
    if (customEncryption?.encrypt) {
      state = customEncryption?.encrypt(store.$state);
    } else {
      state = stateEncrypt(store.$state, encryptionKey);
    }
    storage.setItem(key, state);
  } else {
    let state: Record<string, any> = {};
    cacheFields.forEach((key) => {
      const value = store.$state[key];
      if (value !== undefined && value !== null) {
        state[key] = store.$state[key];
      } else {
        console.warn("Persist key not found", key, store.$id);
      }
    });
    if (customEncryption?.encrypt) {
      storage.setItem(key, customEncryption?.encrypt(state));
    } else {
      storage.setItem(key, stateEncrypt(state, encryptionKey));
    }
  }
};

const storageSync = (
  store: Store,
  storage: Storage,
  oldState: string | null,
  key: string,
  encryptionKey?: string,
  cacheFields?: string[],
  customEncryption?: CustomEncryption
) => {
  if (oldState) {
    let stateObj: Record<string, any>;
    if (customEncryption?.decrypt) {
      stateObj = JSON.parse(customEncryption?.decrypt(oldState));
    } else {
      if (encryptionKey) {
        const bytes = AES.decrypt(oldState, encryptionKey);
        const originalText = bytes.toString(enc.Utf8);
        stateObj = JSON.parse(originalText);
      } else {
        stateObj = JSON.parse(oldState);
      }
    }

    if (!cacheFields) {
      store.$patch(stateObj);
    } else {
      cacheFields.forEach((key) => {
        store.$patch((state: StateTree) => {
          if (state?.[key] !== undefined && state?.[key] !== null) {
            state[key] = stateObj[key];
          } else {
            console.warn(`${store.$id} not found key ${key}`);
          }
        });
      });
    }
  } else {
    storageSet(store, storage, key, encryptionKey, cacheFields, customEncryption);
  }
};

export function usePersist({store, options: {persist}}: PiniaPluginContext) {
  if (persist?.enabled) {
    if (persist.cacheFields && !Array.isArray(persist.cacheFields)) {
      console.warn('Persist cacheFields is String[]', store.$id);
    }

    const key = persist?.key || store.$id
    const keys = persist?.cacheFields;
    const storage = persist?.storage || localStorage;
    const encryptionKey = persist?.encryptionKey
    const customEncryption = persist?.customEncryption;

    try {
      const oldState = storage.getItem(key);
      storageSync(
        store,
        storage,
        oldState,
        key,
        encryptionKey,
        keys,
        customEncryption
      );
    } catch (error) {
      console.error('Persist error', error);
    }

    store.$subscribe(() => {
      storageSet(store, storage, key, encryptionKey, keys, customEncryption);
    }, {
      detached: persist?.detached || true,
      deep: true,
    });
  } else {
    if (persist && Object.keys(persist).length) {
      // console.log(`Persist is not enabled, the current configuration in ${store.$id} will not take effect`);
    }
  }
}
