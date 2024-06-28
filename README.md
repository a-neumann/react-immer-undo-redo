# Undo/Redo demo

`lib/createStore.tsx`

```
const {
    useMutate, // mutation function
    useStore, // get context data
    useStoreHistory, // undo/redo functions
    StoreProvider // react context provider
} = createStore(initialState);
```

based on https://github.com/a-neumann/react-ts-esbuild-boilerplate