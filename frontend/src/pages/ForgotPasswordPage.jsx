/* ForgotPasswordPage.jsx — Cirqle v2
 * Changes:
 * - btn-primary → .btn.btn-primary.w-full
 * - var(--r-md) → 10px (token not defined, use hardcoded border-radius)
 * - All form/API logic 100% untouched
 */

import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Field from "../components/common/Field";

const ForgotPasswordPage = () => {
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    /* ── Original submit logic untouched ─────────────────────── */
    const onSubmit = async (data) => {
        try {
            await axios.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/forgot-password`,
                data,
            );
            setSubmitted(true);
        } catch (error) {
            setError("root.random", {
                type: "random",
                message:
                    error.response?.data?.message || "Something went wrong.",
            });
        }
    };

    return (
        <main className="auth-bg flex min-h-screen items-center justify-center py-8 px-4">
            <div className="w-full max-w-md">
                <div
                    className="card animate-fade-in"
                    style={{ padding: "2rem" }}
                >
                    {/* Back link */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-xs hover:underline mb-5"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--accent)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                        }
                    >
                        ← Back to Sign In
                    </Link>

                    <div className="mb-6">
                        <h2
                            className="font-bold"
                            style={{
                                fontSize: "1.4rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            Forgot password?
                        </h2>
                        <p
                            className="text-sm mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Enter your email and we'll send a reset link.
                        </p>
                    </div>

                    {submitted ? (
                        /* ── Success state ────────────────────────── */
                        <div
                            className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                            style={{
                                background: "var(--success-soft)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                color: "var(--success)",
                            }}
                        >
                            ✅ <strong>Check your inbox.</strong>
                            <br />
                            If that email is registered, a reset link is on its
                            way. The link expires in <strong>15 minutes</strong>
                            .
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
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
                                        Sending…
                                    </span>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
