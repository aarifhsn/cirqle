/* FollowButton.jsx — Cirqle v2
 * Changes from original:
 * - `btn-ghost` / `btn-primary` → `.btn .btn-ghost` / `.btn .btn-primary`
 * - Hover state for "Unfollow" uses CSS vars instead of hardcoded colors
 * - All follow/unfollow API logic 100% untouched
 */

import { useState } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";

const FollowButton = ({ userId }) => {
    const { state, dispatch } = useProfile();
    const [isFollowing, setIsFollowing] = useState(state?.user?.isFollowing);
    const [isHovered, setIsHovered] = useState(false);
    const { api } = useAxios();

    /* ── Original API logic untouched ────────────────────────── */
    const handleFollow = async () => {
        try {
            const response = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/${userId}/follow`,
            );
            if (response.status === 200) {
                setIsFollowing(response.data.isFollowing);
                dispatch({
                    type: actions.profile.FOLLOW_TOGGLED,
                    data: response.data,
                });
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ?? "Failed to update follow!",
            );
        }
    };

    if (isFollowing) {
        return (
            <button
                onClick={handleFollow}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="btn btn-ghost btn-sm"
                style={{
                    borderColor: isHovered
                        ? "var(--danger)"
                        : "var(--border-strong)",
                    color: isHovered
                        ? "var(--danger)"
                        : "var(--text-secondary)",
                    transition: "all var(--transition-fast)",
                }}
            >
                {isHovered ? "✕ Unfollow" : "✓ Following"}
            </button>
        );
    }

    return (
        <button onClick={handleFollow} className="btn btn-primary btn-sm">
            + Follow
        </button>
    );
};

export default FollowButton;
