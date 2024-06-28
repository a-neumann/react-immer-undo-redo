import { createRoot } from "react-dom/client";
import React, { StrictMode } from "react";
import App from "components/App";

createRoot(document.querySelector("#root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
