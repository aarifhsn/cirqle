/* RegistrationForm.jsx — Cirqle v2
 * Changes:
 * - btn-primary → .btn.btn-primary
 * - .spinner class → inline SVG animate-spin
 * - All form/API/validation logic 100% untouched
 */

import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Field from "../common/Field";

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_SERVER_BASE_URL}/auth/google`;

const RegistrationForm = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    /* ── Original submit logic untouched ─────────────────────── */
    const submitForm = async (formData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/register`,
                formData,
            );
            if (response.status === 201) {
                navigate("/verify-email");
            }
        } catch (error) {
            if (
                error.response?.status === 422 &&
                error.response?.data?.errors
            ) {
                const backendErrors = error.response.data.errors;
                Object.keys(backendErrors).forEach((field) => {
                    setError(field, {
                        type: "server",
                        message: backendErrors[field][0],
                    });
                });
            } else {
                setError("root.random", {
                    type: "random",
                    message: `Something went wrong: ${error.response?.data?.message || error.message}`,
                });
            }
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(submitForm)}
                style={{
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name" error={errors.firstName}>
                        <input
                            {...register("firstName", {
                                required: "First name is required",
                            })}
                            className={`auth-input ${errors.firstName ? "!border-[var(--danger)]" : ""}`}
                            type="text"
                            id="firstName"
                            placeholder="John"
                        />
                    </Field>
                    <Field label="Last Name" error={errors.lastName}>
                        <input
                            {...register("lastName")}
                            className={`auth-input ${errors.lastName ? "!border-[var(--danger)]" : ""}`}
                            type="text"
                            id="lastName"
                            placeholder="Doe"
                        />
                    </Field>
                </div>

                <Field label="Email" error={errors.email}>
                    <input
                        {...register("email", {
                            required: "Email is required",
                        })}
                        className={`auth-input ${errors.email ? "!border-[var(--danger)]" : ""}`}
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                    />
                </Field>

                <Field label="Password" error={errors.password}>
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
                        placeholder="Min. 8 characters"
                    />
                </Field>

                {/* Root error */}
                {errors?.root?.random?.message && (
                    <div
                        className="mb-4 px-3 py-2.5 rounded-xl flex items-center gap-2 text-sm"
                        style={{
                            background: "var(--danger-soft)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "var(--danger)",
                        }}
                    >
                        <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {errors.root.random.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full mt-4"
                    style={{ padding: "0.75rem", fontSize: "0.95rem" }}
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
                            Creating account…
                        </span>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>
            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
                <div
                    style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
                <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-muted)" }}
                >
                    or continue with
                </span>
                <div
                    style={{ flex: 1, height: 1, background: "var(--border)" }}
                />
            </div>

            {/* Google OAuth */}
            <a
                href={GOOGLE_AUTH_URL}
                className="flex items-center justify-center gap-2 w-full transition-all"
                style={{
                    border: "1.5px solid var(--border)",
                    borderRadius: 10,
                    padding: "0.7rem",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    background: "var(--input-bg)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "var(--hover-bg)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--input-bg)";
                }}
            >
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

export default RegistrationForm;
