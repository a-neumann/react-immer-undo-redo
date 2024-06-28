import styled from "@emotion/styled";
import { useStoreHistory } from "contexts/ProductStore";
import React from "react";

const UndoRedoContainer = styled("div")({
    marginTop: 40
});

const UndoRedo: React.FC = () => {

    const { undo, redo } = useStoreHistory()

    return (
        <UndoRedoContainer>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
        </UndoRedoContainer>
    );
}

export default UndoRedo;