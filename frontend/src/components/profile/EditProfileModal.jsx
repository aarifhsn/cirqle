import { useState } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";

const EditProfileModal = ({ onClose }) => {
    const { state, dispatch } = useProfile();
    const { auth, setAuth } = useAuth();
    const { api } = useAxios();

    const [form, setForm] = useState({
        firstName: state?.user?.firstName ?? "",
        lastName: state?.user?.lastName ?? "",
        bio: state?.user?.bio ?? "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ── Original logic untouched ────────────────────────────── */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${state?.user?.id}`,
                form,
            );
            if (response.status === 200) {
                dispatch({
                    type: actions.profile.USER_DATA_EDITED,
                    data: response.data,
                });
                setAuth((prev) => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        bio: response.data.bio,
                    },
                }));

                toast.success("Profile updated!");
                onClose();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update profile!",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "var(--bg-overlay)" }}
        >
            <div
                className="card w-full max-w-md animate-fade-in-scale"
                style={{ padding: "1.75rem" }}
            >
                {/* ── Header ────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between mb-5 pb-4"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <div>
                        <h2
                            className="font-bold"
                            style={{
                                fontSize: "1.1rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            Edit Profile
                        </h2>
                        <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Update your public information
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                        aria-label="Close"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* ── Form ──────────────────────────────────────── */}
                <form onSubmit={handleSubmit}>
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-xs font-semibold mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                className="input"
                                required
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-xs font-semibold mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                className="input"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-5">
                        <label
                            htmlFor="bio"
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={4}
                            maxLength={500}
                            className="input"
                            style={{ resize: "none", lineHeight: 1.6 }}
                            placeholder="Write something about yourself…"
                        />
                        <div className="flex justify-end mt-1">
                            <span
                                className="text-xs"
                                style={{
                                    color:
                                        form.bio.length > 450
                                            ? "var(--danger)"
                                            : "var(--text-muted)",
                                }}
                            >
                                {form.bio.length} / 500
                            </span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary flex-1"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
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
                                    Saving…
                                </span>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
