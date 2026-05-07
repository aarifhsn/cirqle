// src/pages/ResetPasswordPage.jsx
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
            setTimeout(() => navigate("/login"), 3000); // redirect after 3s
        } catch (error) {
            setError("root.random", {
                type: "random",
                message:
                    error.response?.data?.message || "Something went wrong.",
            });
        }
    };

    // Guard: invalid link
    if (!token || !email) {
        return (
            <main className="auth-bg flex min-h-screen items-center justify-center px-4">
                <div
                    className="card"
                    style={{ padding: "2rem", maxWidth: 400 }}
                >
                    <p style={{ color: "var(--danger)", fontWeight: 600 }}>
                        Invalid reset link. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="hover:underline"
                        style={{ color: "var(--accent)", fontSize: "0.875rem" }}
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
                <div className="card" style={{ padding: "2rem" }}>
                    <div className="mb-6">
                        <h2
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                            }}
                        >
                            Set new password
                        </h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.875rem",
                                marginTop: "0.3rem",
                            }}
                        >
                            Choose a strong password for your account.
                        </p>
                    </div>

                    {success ? (
                        <div
                            style={{
                                background: "var(--success-soft, #d1fae5)",
                                border: "1px solid rgba(16,185,129,0.3)",
                                borderRadius: "var(--r-md)",
                                padding: "1rem 1.25rem",
                                color: "var(--success, #065f46)",
                                fontSize: "0.875rem",
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
                                    className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2"
                                    style={{
                                        background: "var(--danger-soft)",
                                        border: "1px solid rgba(255,77,109,0.25)",
                                        color: "var(--danger)",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {errors.root.random.message}
                                    {errors.root.random.message.includes(
                                        "expired",
                                    ) && (
                                        <Link
                                            to="/forgot-password"
                                            style={{
                                                color: "var(--accent)",
                                                marginLeft: "0.4rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Request new link
                                        </Link>
                                    )}
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
                                {isSubmitting ? "Updating…" : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordPage;
