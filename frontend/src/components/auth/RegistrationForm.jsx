import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Field from "../common/Field";

const RegistrationForm = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm();

    const submitForm = async (formData) => {
        try {
            let response = await axios.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/register`,
                formData,
            );
            if (response.status === 201) {
                navigate("/login");
            }
        } catch (error) {
            console.error(error);
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
        <form
            onSubmit={handleSubmit(submitForm)}
            style={{
                paddingBottom: "1.5rem",
                borderBottom: "1px solid var(--border)",
            }}
        >
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
                    {...register("email", { required: "Email is required" })}
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
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <span
                            className="spinner"
                            style={{ width: 18, height: 18 }}
                        />
                        Creating account…
                    </span>
                ) : (
                    "Create Account"
                )}
            </button>
        </form>
    );
};

export default RegistrationForm;
