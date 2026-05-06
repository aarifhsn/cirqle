import { useEffect, useState } from "react";

import { AuthContext } from "../context";

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        // Initialize from localStorage
        const savedAuth = localStorage.getItem("auth");
        return savedAuth ? JSON.parse(savedAuth) : {};
    });

    // Persist auth to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
