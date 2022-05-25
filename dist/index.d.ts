import { PiniaPluginContext } from 'pinia';

declare type PersistOptions = {
    log?: boolean;
    enabled?: boolean;
    keys?: string[];
    storage?: Storage;
    encryptionKey?: string;
    detached?: boolean;
};
declare module 'pinia' {
    interface DefineStoreOptionsBase<S, Store> {
        persist?: PersistOptions;
    }
}
declare function usePersist({ store, options }: PiniaPluginContext): void;

export { usePersist };
