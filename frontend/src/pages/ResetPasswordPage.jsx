/* ResetPasswordPage.jsx — Cirqle v2
 * Changes:
 * - btn-primary → .btn.btn-primary
 * - var(--r-md) → border-radius 10px
 * - SVG spinner instead of .spinner class
 * - All form/API/redirect logic 100% untouched
 */

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Field from "../components/common/Field";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    /* ── Original submit logic untouched ─────────────────────── */
    const onSubmit = async (data) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/reset-password`,
                {
                    email,
                    token,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                },
            );
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setError("root.random", {
                type: "random",
                message:
                    error.response?.data?.message || "Something went wrong.",
            });
        }
    };

    /* ── Invalid link guard ───────────────────────────────────── */
    if (!token || !email) {
        return (
            <main className="auth-bg flex min-h-screen items-center justify-center px-4">
                <div
                    className="card animate-fade-in"
                    style={{ padding: "2rem", maxWidth: 400 }}
                >
                    <p
                        className="font-semibold mb-3"
                        style={{ color: "var(--danger)" }}
                    >
                        ⚠️ Invalid reset link. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="text-sm hover:underline"
                        style={{ color: "var(--accent)" }}
                    >
                        Request new link →
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-bg flex min-h-screen items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div
                    className="card animate-fade-in"
                    style={{ padding: "2rem" }}
                >
                    <div className="mb-6">
                        <h2
                            className="font-bold"
                            style={{
                                fontSize: "1.4rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            Set new password
                        </h2>
                        <p
                            className="text-sm mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Choose a strong password for your account.
                        </p>
                    </div>

                    {success ? (
                        <div
                            className="rounded-xl px-4 py-3 text-sm"
                            style={{
                                background: "var(--success-soft)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                color: "var(--success)",
                            }}
                        >
                            ✅ <strong>Password updated!</strong> Redirecting
                            you to login…
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Field label="New Password" error={errors.password}>
                                <input
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message:
                                                "At least 8 characters required",
                                        },
                                    })}
                                    className={`auth-input ${errors.password ? "!border-[var(--danger)]" : ""}`}
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </Field>

                            <Field
                                label="Confirm Password"
                                error={errors.password_confirmation}
                            >
                                <input
                                    {...register("password_confirmation", {
                                        required:
                                            "Please confirm your password",
                                        validate: (val) =>
                                            val === watch("password") ||
                                            "Passwords do not match",
                                    })}
                                    className={`auth-input ${errors.password_confirmation ? "!border-[var(--danger)]" : ""}`}
                                    type="password"
                                    id="password_confirmation"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </Field>

                            {errors?.root?.random?.message && (
                                <div
                                    className="mb-4 px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm"
                                    style={{
                                        background: "var(--danger-soft)",
                                        border: "1px solid rgba(239,68,68,0.25)",
                                        color: "var(--danger)",
                                    }}
                                >
                                    {errors.root.random.message}
                                    {errors.root.random.message.includes(
                                        "expired",
                                    ) && (
                                        <Link
                                            to="/forgot-password"
                                            className="font-semibold ml-1"
                                            style={{ color: "var(--accent)" }}
                                        >
                                            Request new link
                                        </Link>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary w-full"
                                style={{
                                    padding: "0.75rem",
                                    fontSize: "0.95rem",
                                }}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg
                                            className="w-4 h-4 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
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
                                        Updating…
                                    </span>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage;
