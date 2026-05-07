import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Field from "../common/Field";

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_SERVER_BASE_URL}/auth/google`;

const LoginForm = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const [rateLimitSeconds, setRateLimitSeconds] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        clearErrors,
    } = useForm();

    const submitForm = async (formData) => {
        // Block submit if still rate limited
        if (rateLimitSeconds > 0) return;

        clearErrors();

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/login`,
                formData,
            );
            if (response.status === 200) {
                const { user, authToken, refreshToken } = response.data;
                if (authToken) {
                    setAuth({ user, authToken, refreshToken });
                    navigate("/");
                }
            }
        } catch (error) {
            const status = error.response?.status;
            const data = error.response?.data;

            if (status === 429) {
                // ── Too many attempts ──
                const seconds = data?.retry_after || 15 * 60;
                setRateLimitSeconds(seconds);

                // Countdown timer
                const interval = setInterval(() => {
                    setRateLimitSeconds((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return null;
                        }
                        return prev - 1;
                    });
                }, 1000);

                setError("root.random", {
                    type: "rateLimit",
                    message: data?.message || "Too many attempts. Please wait.",
                });
            } else if (status === 401) {
                // ── Wrong credentials — show remaining attempts ──
                setError("root.random", {
                    type: "random",
                    message: data?.message || "Invalid email or password.",
                });
            } else if (status === 422 && data?.errors) {
                Object.keys(data.errors).forEach((field) => {
                    setError(field, {
                        type: "server",
                        message: data.errors[field][0],
                    });
                });
            } else {
                setError("root.random", {
                    type: "random",
                    message: data?.message || "Something went wrong.",
                });
            }
        }
    };

    // Format seconds → "14:32"
    const formatCountdown = (secs) => {
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const isRateLimited = rateLimitSeconds > 0;

    return (
        <>
            <form onSubmit={handleSubmit(submitForm)}>
                <Field label="Email" error={errors.email}>
                    <input
                        {...register("email", {
                            required: "Email is required",
                        })}
                        className={`auth-input ${errors.email ? "!border-[var(--danger)]" : ""}`}
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </Field>

                {/* ── Password field with inline "Forgot password?" link ── */}
                <Field
                    label="Password"
                    error={errors.password}
                    label={
                        <Link
                            to="/forgot-password"
                            style={{
                                fontSize: "0.78rem",
                                color: "var(--accent)",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                            className="hover:underline"
                        >
                            Forgot password?
                        </Link>
                    }
                >
                    <input
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message: "At least 8 characters required",
                            },
                        })}
                        className={`auth-input ${errors.password ? "!border-[var(--danger)]" : ""}`}
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </Field>

                {/* ── Error / Rate-limit banner ── */}
                {errors?.root?.random?.message && (
                    <div
                        className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2"
                        style={{
                            background: isRateLimited
                                ? "var(--warning-soft, #fef3c7)"
                                : "var(--danger-soft)",
                            border: isRateLimited
                                ? "1px solid rgba(245,158,11,0.35)"
                                : "1px solid rgba(255,77,109,0.25)",
                            color: isRateLimited
                                ? "var(--warning, #92400e)"
                                : "var(--danger)",
                            fontSize: "0.85rem",
                        }}
                    >
                        <svg
                            className="w-4 h-4 shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>
                            {errors.root.random.message}
                            {/* Live countdown */}
                            {isRateLimited && (
                                <strong>
                                    {" "}
                                    Try again in{" "}
                                    {formatCountdown(rateLimitSeconds)}.
                                </strong>
                            )}
                        </span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || isRateLimited}
                    className="btn-primary w-full mt-1"
                    style={{
                        padding: "0.8rem",
                        fontSize: "0.95rem",
                        borderRadius: "var(--r-md)",
                        opacity: isRateLimited ? 0.5 : 1,
                        cursor: isRateLimited ? "not-allowed" : "pointer",
                    }}
                >
                    {isRateLimited ? (
                        `Locked · ${formatCountdown(rateLimitSeconds)}`
                    ) : isSubmitting ? (
                        <>
                            <span
                                className="spinner"
                                style={{ width: 18, height: 18 }}
                            />{" "}
                            Signing in…
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-5">
                <div
                    style={{
                        flex: 1,
                        height: "1px",
                        background: "var(--border)",
                    }}
                />
                <span
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                    }}
                >
                    or continue with
                </span>
                <div
                    style={{
                        flex: 1,
                        height: "1px",
                        background: "var(--border)",
                    }}
                />
            </div>

            {/* ── Google OAuth button ── */}
            <a
                href={GOOGLE_AUTH_URL}
                className="flex items-center justify-center gap-2 w-full"
                style={{
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "#aaa")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                }
            >
                {/* Google "G" SVG */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Continue with Google
            </a>
        </>
    );
};

export default LoginForm;
