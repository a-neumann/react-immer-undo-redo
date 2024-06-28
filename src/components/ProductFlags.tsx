import styled from "@emotion/styled";
import React from "react";

const Flag = styled.span<{ active: boolean }>(({ active }) => ({
    padding: "2px 5px",
    borderRadius: 3,
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 5,
    background: active ? "green" : "red",
    userSelect: "none"
}));

const ProductFlags: React.FC<{
    newProduct: boolean,
    featuredProduct: boolean,
    setNew: (value: boolean) => void,
    setFeatured: (value: boolean) => void
}> = ({ newProduct, featuredProduct, setNew, setFeatured }) => {

    return (
        <div>
            <Flag active={newProduct} onClick={() => { setNew(!newProduct); }}>New</Flag>
            <Flag active={featuredProduct} onClick={() => setFeatured(!featuredProduct)}>Featured</Flag>
        </div>
    );
}

export default ProductFlags;