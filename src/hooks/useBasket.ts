import { useMutate, useStore } from "contexts/ProductStore";

export default function useBasket() {

    const { basket, products } = useStore();
    const mutate = useMutate();

    return {
        productsInBasket: basket.map(([id, amount]) => ({ product: products.find(p => p.id === id)!, amount })),
        addToBasket: (id: number) => mutate(basket, b => {
            const entry = b.find(([i]) => i === id);
            if (entry) {
                entry[1] += 1;
            } else {
                b.push([id, 1]);
            }
        })
    };
}