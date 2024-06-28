import styled from "@emotion/styled";
import React, { memo } from "react";
import ProductFlags from "./ProductFlags";
import useBasket from "hooks/useBasket";
import { getPath } from "lib/annotateWithPaths";
import { IProduct, useMutate } from "contexts/ProductStore";

const ProductItemContainer = styled.div({
    border: "1px solid #ccc",
    padding: 10,
    width: 220
});

const ProductItem: React.FC<{ product: IProduct }> = ({ product }) => {

    const { addToBasket } = useBasket();

    const mutate = useMutate();

    const onAddToBasketClick = () => {
        console.log("paths to update: " + getPath(product));
        addToBasket(product.id);
    };

    return (
        <ProductItemContainer>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <button onClick={onAddToBasketClick}>Add to basket</button>
            <ProductFlags
                newProduct={product.flags.newProduct}
                featuredProduct={product.flags.featuredProduct}
                setNew={() => mutate(product.flags, f => f.newProduct = !f.newProduct)}
                setFeatured={() => mutate(product.flags, f => f.featuredProduct = !f.featuredProduct)}
            />
        </ProductItemContainer>
    );
};

export default memo(ProductItem);