import React from "react";
import Basket from "./Basket";
import ProductList from "./ProductList";
import Layout from "./Layout";
import UndoRedo from "./UndoRedo";
import { StoreProvider } from "contexts/ProductStore";
import styled from "@emotion/styled";

const FooterContainer = styled("footer")({
    textAlign: "center",
    marginTop: 40 
});

const Footer: React.FC = () => {

    console.log("Footer rendered");

    return (
        <FooterContainer>
            <p>© 2024 My App</p>
        </FooterContainer>
    );
}

const App: React.FC = () => {

    return (
        <StoreProvider>
            <Layout>
                <ProductList />
                <Basket />
                <UndoRedo />
            </Layout>
            <Footer />
        </StoreProvider>
    );
};

export default App;