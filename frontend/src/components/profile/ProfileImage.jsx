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
            toast.error("Failed to update profile photo!");
        }
    };

    return (
        <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-full ring-4 ring-[#1E1F24]">
            {state?.user?.avatar ? (
                <img
                    className="w-full h-full rounded-full object-cover"
                    src={`${import.meta.env.VITE_STORAGE_URL}/${state.user.avatar}`}
                    alt={state?.user?.firstName}
                />
            ) : (
                <div className="w-full h-full rounded-full bg-lwsGreen flex items-center justify-center text-deepDark font-bold text-2xl">
                    {state?.user?.firstName?.[0]}
                    {state?.user?.lastName?.[0]}
                </div>
            )}

            {/* Edit overlay — only for my profile */}
            {isMe && (
                <>
                    <button
                        onClick={handleImageUpload}
                        className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center"
                    >
                        <svg
                            className="w-6 h-6 text-white"
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
                    </button>
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
