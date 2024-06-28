import React from "react";
import styled from "@emotion/styled";
import useBasket from "hooks/useBasket";

const BasketContainer = styled.div({
    position: "fixed",
    top: 0,
    right: 0,
    border: "1px solid #ccc",
    padding: 10,
    width: 200,
    background: "#fff",
});

const Basket: React.FC = () => {

    const { productsInBasket } = useBasket();

    return (
        <BasketContainer>
            <h2>Basket</h2>
            <ul>
                {productsInBasket.map(entry => (
                    <li key={entry.product.id}>{entry.product.name} - {entry.product.price} ({entry.amount})</li>
                ))}
            </ul>
        </BasketContainer>
    );
}

export default Basket;