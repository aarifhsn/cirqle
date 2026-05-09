import { useRef } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";

const ProfileImage = () => {
    const { state, dispatch } = useProfile();
    const { auth } = useAuth();
    const { api } = useAxios();
    const fileUploaderRef = useRef();
    const isMe = Number(state?.user?.id) === Number(auth?.user?.id);

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
                toast.success("Profile photo updated!");
            }
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message ||
                "Failed to update profile photo!";
            toast.error(message);
        }
    };

    const size = 88;

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                border: "3px solid var(--bg-card)",
                outline: "2px solid var(--accent)",
                position: "relative",
                flexShrink: 0,
                cursor: isMe ? "pointer" : "default",
            }}
            onClick={handleImageUpload}
        >
            {state?.user?.avatar ? (
                <img
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        display: "block",
                    }}
                    src={`${import.meta.env.VITE_STORAGE_URL}/${state.user.avatar}`}
                    alt={state?.user?.firstName}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full rounded-full uppercase bg-gradient-to-r from-[#00D991]/40 via-[#1E1F24] to-[#27292F] text-white text-2xl font-bold tracking-wide">
                    {state?.user?.firstName?.[0]}
                    {state?.user?.lastName?.[0]}
                </div>
            )}

            {/* Camera overlay on hover */}
            {isMe && (
                <>
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 150ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                "rgba(0,0,0,0.45)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(0,0,0,0)";
                        }}
                    >
                        <svg
                            style={{
                                width: 22,
                                height: 22,
                                color: "#fff",
                                opacity: 0,
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = 1;
                            }}
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
