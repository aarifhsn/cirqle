/* GoogleSuccess.jsx — Cirqle v2
 * Changes:
 * - Replaced plain <p>Logging in...</p> with a proper loading screen
 * - All auth token parsing / redirect logic 100% untouched
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GoogleSuccess() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    /* ── Original logic untouched ────────────────────────────── */
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
            setAuth({ authToken: token });
            navigate("/");
        } else {
            navigate("/login");
        }
    }, []);

    return (
        <div
            className="min-h-screen flex-center flex-col gap-4"
            style={{ background: "var(--bg-base)" }}
        >
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--accent-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <svg
                    className="w-6 h-6 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--accent)" }}
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    />
                </svg>
            </div>
            <p
                className="text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
            >
                Signing you in with Google…
            </p>
        </div>
    );
}
