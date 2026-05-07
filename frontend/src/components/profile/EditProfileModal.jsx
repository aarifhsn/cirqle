import { useState } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";

const EditProfileModal = ({ onClose }) => {
    const { state, dispatch } = useProfile();
    const { api } = useAxios();

    const [form, setForm] = useState({
        firstName: state?.user?.firstName ?? "",
        lastName: state?.user?.lastName ?? "",
        bio: state?.user?.bio ?? "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                toast.success("Profile updated!");
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
        >
            <div
                className="modal-content card w-full max-w-md"
                style={{ padding: "1.75rem" }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1.5rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: "1.15rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                            }}
                        >
                            Edit Profile
                        </h2>
                        <p
                            style={{
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                                marginTop: "0.15rem",
                            }}
                        >
                            Update your public information
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="icon-btn"
                        style={{ width: 32, height: 32 }}
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

                <form onSubmit={handleSubmit}>
                    {/* Name row */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <div>
                            <label
                                htmlFor="firstName"
                                className="auth-label"
                                style={{
                                    marginBottom: "0.4rem",
                                    display: "block",
                                }}
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                className="auth-input"
                                required
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="auth-label"
                                style={{
                                    marginBottom: "0.4rem",
                                    display: "block",
                                }}
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                className="auth-input"
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div style={{ marginBottom: "1.25rem" }}>
                        <label
                            htmlFor="bio"
                            className="auth-label"
                            style={{ marginBottom: "0.4rem", display: "block" }}
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
                            className="auth-input"
                            style={{ resize: "none", lineHeight: 1.6 }}
                            placeholder="Write something about yourself…"
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "0.3rem",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.72rem",
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

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary"
                            style={{ flex: 1 }}
                        >
                            {isSubmitting ? (
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <span
                                        className="spinner"
                                        style={{ width: 16, height: 16 }}
                                    />
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
