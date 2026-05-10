import axios from "axios";
import { useEffect, useState } from "react";
import { AuthContext } from "../context";

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const savedAuth = localStorage.getItem("auth");
        return savedAuth ? JSON.parse(savedAuth) : {};
    });

    // Save auth state
    useEffect(() => {
        localStorage.setItem("auth", JSON.stringify(auth));
    }, [auth]);

    // Ask location only once
    useEffect(() => {
        const sendLocationOnce = async () => {
            if (!auth?.authToken) return;

            // already sent before
            if (localStorage.getItem("location_sent")) return;

            if (!navigator.geolocation) return;

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        await axios.patch(
                            `${import.meta.env.VITE_SERVER_BASE_URL}/users/location`,
                            {
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude,
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${auth.authToken}`,
                                },
                            },
                        );

                        // success flag
                        localStorage.setItem("location_sent", "1");
                    } catch (error) {
                        console.error("Failed to update location", error);
                    }
                },
                (error) => {
                    console.error("Failed to get location", error);
                },
            );
        };

        sendLocationOnce();
    }, [auth?.authToken]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
