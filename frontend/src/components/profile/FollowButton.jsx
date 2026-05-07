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
            console.error(error);
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
                className="btn-ghost"
                style={{
                    fontSize: "0.85rem",
                    borderColor: isHovered
                        ? "var(--danger)"
                        : "var(--border-strong)",
                    color: isHovered
                        ? "var(--danger)"
                        : "var(--text-secondary)",
                    transition: "all 150ms ease",
                }}
            >
                {isHovered ? "Unfollow" : "Following ✓"}
            </button>
        );
    }

    return (
        <button
            onClick={handleFollow}
            className="btn-primary"
            style={{ fontSize: "0.85rem" }}
        >
            + Follow
        </button>
    );
};

export default FollowButton;
