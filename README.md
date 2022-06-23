# Documentation

## Install
```typescript
npm i pinia-use-persist
```

## Use

main.ts

```typescript

import {createPinia} from "pinia";

import {usePersist} from 'pinia-use-persist'

const pinia = createPinia()

pinia.use(usePersist)

app.use(pinia)

```

store.ts
```typescript
export const useStore = defineStore('main', {
  state: () => ({
    counter: 0,
  }),
  persist:{
    enabled: true,
    key: ['counter'],
    encryptionKey: 'my-store',
    storage: sessionStorage,
  }
})
```


```vue

<script setup lang='ts'>
import { useStore } from '@/store/store.ts'
const store = useStore()

const add = () => {
  store.$patch((state) => {
    state.counter = state.counter + 1
  })
}
</script>

<template>
  <div>
    <p>{{store.$state.counter}}</p>
    <button @click="add">+</button>
  </div>
</template>

```

### Note: 📢

When you add new key-value in store.ts file, you need to reload the page to achieve persistence.

### Plan 📢

1. Logger
2. Encryption
3. ...
