import { useState } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";

const FollowButton = ({ userId }) => {
    const { state, dispatch } = useProfile();
    const [isFollowing, setIsFollowing] = useState(state?.user?.isFollowing);
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
            console.error(error.response?.data);
            toast.error(
                error.response?.data?.message ?? "Failed to update follow!",
            );
        }
    };

    return (
        <button
            onClick={handleFollow}
            className={`px-6 py-2 rounded-md font-semibold transition-all ${
                isFollowing
                    ? "bg-lighterDark text-white hover:bg-red-500"
                    : "bg-lwsGreen text-deepDark hover:opacity-90"
            }`}
        >
            {isFollowing ? "Unfollow" : "Follow"}
        </button>
    );
};

export default FollowButton;
