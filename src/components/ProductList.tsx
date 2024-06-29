import styled from "@emotion/styled";
import React, { memo } from "react";
import ProductItem from "./ProductItem";
import { useMutate, useMutateAsync, useStore } from "contexts/ProductStore";

const ProductListContainer = styled.div({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 20,
});

const ProductList: React.FC = () => {

    console.log("ProductList rendered")

    const store = useStore();
    const mutate = useMutate();
    const mutateAsync = useMutateAsync();

    const sort = (asc: boolean) => {
        mutate(store.products, p => {
            p.sort((a, b) => asc ? (a.price - b.price) : (b.price - a.price));
        });
    };

    const fetchNewProducts = () => mutateAsync(store, async (s, abort) => {
        // wait for 1 second
        await new Promise(resolve => setTimeout(resolve, 5000));
        abort.onAbort(() => {
            console.log("fetchNewProducts aborted");
        });
        if (abort.aborted) return;
        const newProducts = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `New Product ${i}`, price: 200 + i, flags: { newProduct: true, featuredProduct: i % 3 === 0 } }));
        s.products = newProducts;
    });

    return (
        <>
            <ProductListContainer>
                {store.products.slice(0, 20).map(product => (
                    <ProductItem key={product.id} product={product} />
                ))}
            </ProductListContainer>
            <p>{store.products.length} products</p>
            <p>Sort by</p>
            <button onClick={() => sort(true)}>price asc</button>
            <button onClick={() => sort(false)}>price desc</button>
            <p>Async</p>
            <button onClick={fetchNewProducts}>Fetch new products</button>
        </>
    );
};

export default memo(ProductList);