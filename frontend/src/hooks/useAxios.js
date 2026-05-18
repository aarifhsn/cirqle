import axios from "axios";
import { useEffect, useRef } from "react";
import { api } from "../api";
import { useAuth } from "./useAuth";

const useAxios = () => {
    const { auth, setAuth } = useAuth();

    // ref always holds latest auth without triggering re-registration
    const authRef = useRef(auth);
    useEffect(() => {
        authRef.current = auth;
    }, [auth]); // ← still tracks auth changes, just doesn't re-register interceptors

    useEffect(() => {
        const requestIntercept = api.interceptors.request.use(
            (config) => {
                const authToken = authRef.current?.authToken; // ← always latest
                if (authToken) {
                    config.headers.Authorization = `Bearer ${authToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        const responseIntercept = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    // stop loop if no refresh token
                    if (!authRef.current?.refreshToken) {
                        setAuth({});
                        localStorage.removeItem("auth");
                        window.location.href = "/login";
                        return Promise.reject(error);
                    }

                    try {
                        const response = await axios.post(
                            `${import.meta.env.VITE_SERVER_BASE_URL}/auth/refresh-token`,
                            { refreshToken: authRef.current.refreshToken },
                        );
                        const { token, refreshToken: newRefreshToken } =
                            response.data;

                        setAuth({
                            ...authRef.current,
                            authToken: token,
                            refreshToken: newRefreshToken,
                        });

                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    } catch (error) {
                        setAuth({});
                        localStorage.removeItem("auth");
                        window.location.href = "/login";
                        throw error;
                    }
                }

                return Promise.reject(error);
            },
        );

        return () => {
            api.interceptors.request.eject(requestIntercept);
            api.interceptors.response.eject(responseIntercept);
        };
    }, []); // ← registers once only

    return { api };
};

export default useAxios;
