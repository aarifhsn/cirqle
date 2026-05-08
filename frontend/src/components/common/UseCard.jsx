import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "./Avatar";

const UserCard = ({ person }) => {
    const { auth } = useAuth();
    const { api } = useAxios();
    const [isFollowing, setIsFollowing] = useState(person.isFollowing);
    const isMe =
        person.id === auth?.user?.id ||
        person.username === auth?.user?.username;

    const handleFollow = async () => {
        try {
            const response = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/${person.id}/follow`,
            );
            if (response.status === 200) {
                setIsFollowing(response.data.isFollowing);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to update follow!");
        }
    };

    return (
        <div className="card flex items-center gap-3 p-4">
            <Link
                to={
                    person.username
                        ? `/${person.username}`
                        : `/users/${person.id}`
                }
            >
                <Avatar user={person} size="md" />
            </Link>

            <div className="flex-1 min-w-0">
                <Link
                    to={
                        person.username
                            ? `/${person.username}`
                            : `/users/${person.id}`
                    }
                    className="font-semibold text-white text-sm hover:text-lwsGreen transition-all truncate block"
                >
                    {person.firstName} {person.lastName}
                </Link>
                <p className="text-xs text-gray-500 truncate">
                    @{person.username ?? person.email}
                </p>
            </div>

            {!isMe && (
                <button
                    onClick={handleFollow}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isFollowing
                            ? "bg-lighterDark text-gray-300 hover:bg-red-500/20 hover:text-red-400 border border-[#3F3F3F]"
                            : "bg-lwsGreen text-deepDark hover:opacity-90"
                    }`}
                >
                    {isFollowing ? "Unfollow" : "Follow"}
                </button>
            )}
        </div>
    );
};

export default UserCard;
