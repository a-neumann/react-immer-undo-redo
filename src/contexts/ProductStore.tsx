import { enablePatches, enableMapSet, setAutoFreeze } from "immer";
import createStore from "lib/createStore";
enablePatches();
enableMapSet();
setAutoFreeze(false);

const manyProducts = Array.from({ length: 2000 }, (_, i) => ({ id: i, name: `Product ${i}`, price: 100 + i, flags: { newProduct: i % 2 === 0, featuredProduct: i % 3 === 0 } }));

const initial: IProductContext = {
    // products: [
    //     { id: 1, name: "Product 1", price: 100, flags: { newProduct: true, featuredProduct: false } },
    //     { id: 2, name: "Product 2", price: 200, flags: { newProduct: false, featuredProduct: true } },
    //     { id: 3, name: "Product 3", price: 300, flags: { newProduct: false, featuredProduct: false} },
    //     { id: 4, name: "Product 4", price: 300, flags: { newProduct: false, featuredProduct: false} }
    // ],
    products: manyProducts,
    basket: [[1, 2]]
};

export interface IProduct {
    id: number;
    name: string;
    price: number;
    flags: {
        newProduct: boolean,
        featuredProduct: boolean
    }
}

export interface IProductContext {
    products: IProduct[];
    basket: [id: number, amount: number][];
}

export const { useMutate, useStore, useStoreHistory, StoreProvider } = createStore(initial);