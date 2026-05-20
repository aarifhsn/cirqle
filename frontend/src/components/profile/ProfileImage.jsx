import { useRef } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";
import Avatar from "../common/Avatar";

const ProfileImage = () => {
    const { state, dispatch } = useProfile();
    const { auth, setAuth } = useAuth();
    const { api } = useAxios();
    const fileUploaderRef = useRef();
    const isMe = Number(state?.user?.id) === Number(auth?.user?.id);

    /* ── Original upload logic untouched ─────────────────────── */
    const handleImageUpload = () => {
        if (!isMe) return;
        fileUploaderRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const response = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${state?.user?.id}/avatar`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            if (response.status === 200) {
                dispatch({
                    type: actions.profile.IMAGE_UPDATED,
                    data: response.data,
                });
                setAuth((prev) => ({
                    ...prev,
                    user: {
                        ...prev.user,
                        avatar: response.data.avatar,
                    },
                }));
                toast.success("Profile photo updated!");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to update profile photo!",
            );
        }
    };

    return (
        <div
            className="flex justify-center items-center"
            onClick={handleImageUpload}
            style={{
                position: "relative",
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "3px solid var(--card-bg)",
                outline: "2.5px solid var(--accent)",
                outlineOffset: 1,
                flexShrink: 0,
                cursor: isMe ? "pointer" : "default",
            }}
        >
            <Avatar user={state?.user} size="lg" />

            {/* ── Camera overlay (isMe only) ────────────────────── */}
            {isMe && (
                <>
                    <div
                        className="absolute inset-0 rounded-full flex-center transition-all duration-200"
                        style={{ background: "rgba(0,0,0,0)" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                "rgba(0,0,0,0.45)";
                            e.currentTarget.querySelector("svg").style.opacity =
                                "1";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(0,0,0,0)";
                            e.currentTarget.querySelector("svg").style.opacity =
                                "0";
                        }}
                    >
                        <svg
                            style={{
                                width: 22,
                                height: 22,
                                color: "#fff",
                                opacity: 0,
                                transition: "opacity 150ms ease",
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="file"
                        ref={fileUploaderRef}
                        accept="image/*"
                        hidden
                        onChange={handleFileChange}
                    />
                </>
            )}
        </div>
    );
};

export default ProfileImage;
