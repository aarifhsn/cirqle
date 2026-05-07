// src/pages/ForgotPasswordPage.jsx
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
                <div className="card" style={{ padding: "2rem" }}>
                    {/* Back link */}
                    <Link
                        to="/login"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.82rem",
                            color: "var(--text-muted)",
                            textDecoration: "none",
                            marginBottom: "1.25rem",
                        }}
                        className="hover:underline"
                    >
                        ← Back to Sign In
                    </Link>

                    <div className="mb-6">
                        <h2
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                            }}
                        >
                            Forgot password?
                        </h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.875rem",
                                marginTop: "0.3rem",
                            }}
                        >
                            Enter your email and we'll send a reset link.
                        </p>
                    </div>

                    {submitted ? (
                        /* ── Success state ── */
                        <div
                            style={{
                                background: "var(--success-soft, #d1fae5)",
                                border: "1px solid rgba(16,185,129,0.3)",
                                borderRadius: "var(--r-md)",
                                padding: "1rem 1.25rem",
                                color: "var(--success, #065f46)",
                                fontSize: "0.875rem",
                                lineHeight: 1.6,
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
                                    className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2"
                                    style={{
                                        background: "var(--danger-soft)",
                                        border: "1px solid rgba(255,77,109,0.25)",
                                        color: "var(--danger)",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {errors.root.random.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full mt-1"
                                style={{
                                    padding: "0.8rem",
                                    fontSize: "0.95rem",
                                    borderRadius: "var(--r-md)",
                                }}
                            >
                                {isSubmitting ? "Sending…" : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
