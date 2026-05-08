import { useRef, useState } from "react";
import { Link } from "react-router-dom";
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
                `/profile/${state?.user?.id}/cover`,
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
                    <div className="absolute bottom-3 right-3 z-20">
                        <button
                            type="button"
                            onClick={() => coverRef.current.click()}
                            className="flex items-center gap-2 cursor-pointer bg-black/50 hover:bg-black/70 text-white text-sm px-3 py-1.5 rounded-md transition-all"
                        >
                            Add Cover
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
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
                    <p className="text-gray-400 text-xs lg:text-sm">
                        {state?.user?.email}
                    </p>
                </div>

                {/* Bio */}
                <Bio isMe={isMe} />

                {/* Followers / Following */}
                <div className="flex items-center gap-6 mt-4">
                    <Link
                        to={`/${state?.user?.username}/followers`}
                        className="text-center hover:opacity-80 transition-all"
                    >
                        <span className="block text-xl font-bold text-white">
                            {state?.user?.followersCount ?? 0}
                        </span>
                        <span className="text-sm text-gray-400">Followers</span>
                    </Link>

                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-900" />
                    <Link
                        to={`/${state?.user?.username}/following`}
                        className="text-center hover:opacity-80 transition-all"
                    >
                        <span className="block text-xl font-bold text-white">
                            {state?.user?.followingCount ?? 0}
                        </span>
                        <span className="text-sm text-gray-400">Following</span>
                    </Link>
                    <div className="w-px h-8 bg-slate-300 dark:bg-slate-900" />
                    <div className="text-center hover:opacity-80 transition-all">
                        <span className="block text-xl font-bold text-white">
                            {state?.posts?.length ?? 0}
                        </span>
                        <span className="text-sm text-gray-400">Posts</span>
                    </div>
                </div>

                <div className="border-b border-slate-300 dark:border-slate-900" />
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && (
                <EditProfileModal onClose={() => setShowEditModal(false)} />
            )}
        </div>
    );
};

export default ProfileInfo;
