import { useMutate, useStore } from "contexts/ProductStore";

export default function useBasket() {

    const { basket, products } = useStore();
    const mutate = useMutate();

    return {
        productsInBasket: Array.from(basket).map(([id, amount]) => ({ product: products.find(p => p.id === id)!, amount })),
        addToBasket: (id: number) => mutate(basket, b => {
            const entry = b.get(id);
            if (entry) {
                b.set(id, entry + 1);
            } else {
                b.set(id, 1);
            }
        }),
        clear: () => mutate(basket, b => b.clear())
    };
}