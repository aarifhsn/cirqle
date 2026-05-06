import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";
import Bio from "./Bio";
import EditProfileModal from "./EditProfileModal";
import FollowButton from "./FollowButton";
import ProfileImage from "./ProfileImage";

const ProfileInfo = () => {
    const { state, dispatch } = useProfile();
    const { auth } = useAuth();
    const { api } = useAxios();
    const isMe = Number(state?.user?.id) === Number(auth?.user?.id);
    const [showEditModal, setShowEditModal] = useState(false);
    const coverRef = useRef();

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("cover_photo", file);

        try {
            const response = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${state?.user?.id}/cover`,
                formData,
            );
            if (response.status === 200) {
                dispatch({
                    type: actions.profile.COVER_UPDATED,
                    data: response.data,
                });
                toast.success("Cover photo updated!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update cover photo!");
        }
    };

    return (
        <div className="relative">
            {/* Cover Photo */}
            <div className="relative h-48 lg:h-64 w-full overflow-hidden">
                {state?.user?.cover_photo ? (
                    <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${state.user.cover_photo}`}
                        alt="cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#00D991]/40 via-[#1E1F24] to-[#27292F]" />
                )}

                {/* Cover upload button — only for my profile */}
                {isMe && (
                    <div className="absolute bottom-3 right-3">
                        <label
                            htmlFor="cover_upload"
                            className="flex items-center gap-2 cursor-pointer bg-black/50 hover:bg-black/70 text-white text-sm px-3 py-1.5 rounded-md transition-all"
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
                            {state?.user?.cover_photo
                                ? "Change Cover"
                                : "Add Cover"}
                        </label>
                        <input
                            id="cover_upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={coverRef}
                            onChange={handleCoverUpload}
                        />
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="relative px-4 pb-4">
                {/* Avatar — overlaps cover */}
                <div className="flex items-end justify-between -mt-12 lg:-mt-16 mb-4">
                    <ProfileImage />

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mb-2">
                        {isMe ? (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-md bg-lighterDark text-white text-sm font-medium hover:bg-[#2f3136] transition-all"
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
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                Edit Profile
                            </button>
                        ) : (
                            state?.user?.id && (
                                <FollowButton userId={state?.user?.id} />
                            )
                        )}
                    </div>
                </div>

                {/* Name + Email */}
                <div>
                    <h3 className="text-2xl font-bold text-white lg:text-[28px]">
                        {state?.user?.firstName} {state?.user?.lastName}
                    </h3>
                    <p className="text-gray-400 text-sm lg:text-base">
                        {state?.user?.email}
                    </p>
                </div>

                {/* Bio */}
                <Bio isMe={isMe} />

                {/* Followers / Following */}
                <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                        <span className="block text-xl font-bold text-white">
                            {state?.user?.followersCount ?? 0}
                        </span>
                        <span className="text-sm text-gray-400">Followers</span>
                    </div>
                    <div className="w-px h-8 bg-[#3F3F3F]" />
                    <div className="text-center">
                        <span className="block text-xl font-bold text-white">
                            {state?.user?.followingCount ?? 0}
                        </span>
                        <span className="text-sm text-gray-400">Following</span>
                    </div>
                    <div className="w-px h-8 bg-[#3F3F3F]" />
                    <div className="text-center">
                        <span className="block text-xl font-bold text-white">
                            {state?.posts?.length ?? 0}
                        </span>
                        <span className="text-sm text-gray-400">Posts</span>
                    </div>
                </div>

                <div className="border-b border-[#3F3F3F] mt-6" />
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <EditProfileModal onClose={() => setShowEditModal(false)} />
            )}
        </div>
    );
};

export default ProfileInfo;
