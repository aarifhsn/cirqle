/* ProfileInfo.jsx — Cirqle v2
 * Changes from original:
 * - Replaced ALL hardcoded dark colors (text-white, text-gray-400,
 *   bg-lighterDark, bg-[#2f3136]) with CSS variables
 * - Cover photo gradient fallback uses accent gradient
 * - Edit Profile / Follow buttons use .btn classes
 * - Stats section uses CSS vars (dark/light safe)
 * - All cover upload + API logic 100% untouched
 */

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

    /* ── Cover upload — untouched ─────────────────────────────── */
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
            toast.error(
                error.response?.data?.message || "Failed to update cover!",
            );
        }
    };

    return (
        <div
            className="card animate-fade-in"
            style={{ padding: 0, overflow: "hidden" }}
        >
            {/* ── Cover Photo ───────────────────────────────────── */}
            <div
                className="relative w-full overflow-hidden"
                style={{ height: 200 }}
            >
                {state?.user?.cover_photo ? (
                    <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${state.user.cover_photo}`}
                        alt="cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    /* Design-token gradient fallback */
                    <div
                        className="w-full h-full"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%)",
                            opacity: 0.85,
                        }}
                    />
                )}

                {/* Cover upload button */}
                {isMe && (
                    <div className="absolute bottom-3 right-3 z-20">
                        <button
                            type="button"
                            onClick={() => coverRef.current.click()}
                            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-white transition-all"
                            style={{ background: "rgba(0,0,0,0.5)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(0,0,0,0.72)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(0,0,0,0.5)")
                            }
                        >
                            📷 Add Cover
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={coverRef}
                            onChange={handleCoverUpload}
                        />
                    </div>
                )}
            </div>

            {/* ── Profile body ──────────────────────────────────── */}
            <div className="px-5 pb-5">
                {/* Avatar row */}
                <div
                    className="flex items-end justify-between mb-4"
                    style={{ marginTop: -44 }}
                >
                    <ProfileImage />

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mb-1">
                        {isMe ? (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="btn btn-ghost btn-sm flex items-center gap-1.5"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
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

                {/* Name + username */}
                <div className="mb-1">
                    <h2
                        className="font-bold"
                        style={{
                            fontSize: "1.4rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        {state?.user?.firstName} {state?.user?.lastName}
                    </h2>
                    <p
                        className="text-sm mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        @{state?.user?.username}
                    </p>
                </div>

                {/* Bio */}
                <Bio isMe={isMe} />

                {/* ── Stats row ─────────────────────────────────── */}
                <div
                    className="flex items-center gap-6 mt-4 pt-4"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <Link
                        to={`/${state?.user?.username}/followers`}
                        className="text-center group"
                        style={{ textDecoration: "none" }}
                    >
                        <span
                            className="block font-bold"
                            style={{
                                fontSize: "1.2rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                                transition: "color var(--transition-fast)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                    "var(--text-primary)")
                            }
                        >
                            {state?.user?.followersCount ?? 0}
                        </span>
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Followers
                        </span>
                    </Link>

                    <div
                        style={{
                            width: 1,
                            height: 32,
                            background: "var(--border)",
                        }}
                    />

                    <Link
                        to={`/${state?.user?.username}/following`}
                        className="text-center"
                        style={{ textDecoration: "none" }}
                    >
                        <span
                            className="block font-bold"
                            style={{
                                fontSize: "1.2rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                                transition: "color var(--transition-fast)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                    "var(--text-primary)")
                            }
                        >
                            {state?.user?.followingCount ?? 0}
                        </span>
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Following
                        </span>
                    </Link>

                    <div
                        style={{
                            width: 1,
                            height: 32,
                            background: "var(--border)",
                        }}
                    />

                    <div className="text-center">
                        <span
                            className="block font-bold"
                            style={{
                                fontSize: "1.2rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            {state?.posts?.length ?? 0}
                        </span>
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Posts
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Edit Modal (untouched) ─────────────────────────── */}
            {showEditModal && (
                <EditProfileModal onClose={() => setShowEditModal(false)} />
            )}
        </div>
    );
};

export default ProfileInfo;
