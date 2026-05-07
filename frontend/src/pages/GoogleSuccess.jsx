import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GoogleSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    useEffect(() => {
        const token = params.get("token");
        const refreshToken = params.get("refreshToken");
        const rawUser = params.get("user");

        if (token && rawUser) {
            try {
                const user = JSON.parse(atob(rawUser));
                setAuth({ authToken: token, refreshToken, user });
                navigate("/");
            } catch (e) {
                console.error("Failed to parse user", e);
                navigate("/login");
            }
        } else if (token) {
            // fallback — fetch user from API if user param missing
            setAuth({ authToken: token });
            navigate("/");
        } else {
            navigate("/login");
        }
    }, []);

    return <p>Logging in...</p>;
}
