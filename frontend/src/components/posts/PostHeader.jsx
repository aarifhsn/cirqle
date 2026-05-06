import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import ThreeDotsIcon from "../../assets/icons/3dots.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import EditIcon from "../../assets/icons/edit.svg";
import TimeIcon from "../../assets/icons/time.svg";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { usePost } from "../../hooks/usePost";
import { getDateDifferenceFromNow } from "../../utils";
import Avatar from "../common/Avatar";
import PostEntry from "./PostEntry";

const PostHeader = ({ post }) => {
    const [showAction, setShowAction] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { auth } = useAuth();
    const isMe = post?.author?.id === auth?.user?.id;
    const profileLink = `/${post?.author?.username}`;
    const { dispatch } = usePost();
    const { api } = useAxios();

    console.log("PostHeader render", { post });

    const handleDeletePost = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this post?",
        );
        if (!confirmed) return;

        dispatch({ type: actions.post.DATA_FETCHING });
        try {
            const response = await api.delete(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}`,
            );
            if (response.status === 200) {
                dispatch({ type: actions.post.POST_DELETED, data: post.id });
                toast.success("Post deleted successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete post!");
            dispatch({
                type: actions.post.DATA_FETCH_ERROR,
                error: error.message,
            });
        }
    };

    return (
        <>
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link to={profileLink}>
                        <Avatar user={post?.author} size="md" />
                    </Link>
                    <div>
                        <Link
                            to={profileLink}
                            className="text-lg lg:text-xl hover:underline hover:text-lwsGreen transition-all"
                        >
                            {post?.author?.name}
                        </Link>
                        <div className="flex items-center gap-1.5">
                            <img src={TimeIcon} alt="time" />
                            <span className="text-sm text-gray-400 lg:text-base">
                                {`${getDateDifferenceFromNow(post?.createAt)}`}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {isMe && (
                        <button onClick={() => setShowAction(!showAction)}>
                            <img src={ThreeDotsIcon} alt="3dots of Action" />
                        </button>
                    )}

                    {showAction && (
                        <div className="action-modal-container">
                            <button
                                className="action-menu-item hover:text-lwsGreen"
                                onClick={() => {
                                    setShowEditModal(true);
                                    setShowAction(false);
                                }}
                            >
                                <img src={EditIcon} alt="Edit" />
                                Edit
                            </button>
                            <button
                                className="action-menu-item hover:text-red-500"
                                onClick={handleDeletePost}
                            >
                                <img src={DeleteIcon} alt="Delete" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-xl mx-4">
                        <PostEntry
                            postToEdit={post}
                            onCreate={() => setShowEditModal(false)}
                            onClose={() => setShowEditModal(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PostHeader;
