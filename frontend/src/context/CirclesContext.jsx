import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "../api"; // ← import api directly, not useAxios

const CirclesContext = createContext(null);

export const CirclesProvider = ({ children }) => {
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        // get token directly from localStorage
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        const token = auth?.authToken;

        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/circles`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => setCircles(r.data?.data ?? r.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <CirclesContext.Provider value={{ circles, loading }}>
            {children}
        </CirclesContext.Provider>
    );
};

export const useCircles = () => useContext(CirclesContext);
