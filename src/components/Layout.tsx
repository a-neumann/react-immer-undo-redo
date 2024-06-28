import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <div>
            <h1>My App</h1>
            {children}
        </div>
    );
}

export default Layout;