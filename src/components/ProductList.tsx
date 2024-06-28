import styled from "@emotion/styled";
import React, { memo } from "react";
import ProductItem from "./ProductItem";
import { useStore } from "contexts/ProductStore";

const ProductListContainer = styled.div({
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 20,
});

const ProductList: React.FC = () => {

    console.log("ProductList rendered")

    const store = useStore();

    return (
        <ProductListContainer>
            {store.products.slice(0, 20).map(product => (
                <ProductItem key={product.id} product={product} />
            ))}
        </ProductListContainer>
    );
};

export default memo(ProductList);