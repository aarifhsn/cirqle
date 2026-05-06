import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Field from "../common/Field";

import axios from "axios";

const LoginForm = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm();

    const submitForm = async (formData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/login`,
                formData,
            );

            if (response.status === 200) {
                const { user, authToken, refreshToken } = response.data;
                if (authToken) {
                    console.log(`Login time auth token: ${authToken}`);
                    setAuth({ user, authToken, refreshToken });

                    navigate("/");
                }
            }
        } catch (error) {
            console.error(error);

            // Handle backend validation/auth errors
            if (error.response?.status === 401) {
                setError("root.random", {
                    type: "random",
                    message:
                        error.response?.data?.message ||
                        "Invalid email or password",
                });
            } else if (
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
                    message:
                        error.response?.data?.message || "Something went wrong",
                });
            }
        }
    };

    return (
        <form
            className="border-b border-[#3F3F3F] pb-10 lg:pb-[60px]"
            onSubmit={handleSubmit(submitForm)}
        >
            <Field label="Email" error={errors.email}>
                <input
                    {...register("email", { required: "Email ID is Required" })}
                    className={`auth-input ${
                        errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                    type="email"
                    name="email"
                    id="email"
                />
            </Field>

            <Field label="Password" error={errors.password}>
                <input
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message:
                                "Your password must be at least 8 characters",
                        },
                    })}
                    className={`auth-input ${
                        errors.password ? "border-red-500" : "border-gray-200"
                    }`}
                    type="password"
                    name="password"
                    id="password"
                />
            </Field>
            <p>{errors?.root?.random?.message}</p>
            <Field>
                <button
                    type="submit"
                    className="auth-input bg-lwsGreen font-bold text-deepDark transition-all hover:opacity-90"
                >
                    Login
                </button>
            </Field>
        </form>
    );
};

export default LoginForm;
