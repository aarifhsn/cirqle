import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { usePost } from "../../hooks/usePost";
import { getDateDifferenceFromNow } from "../../utils";
import Avatar from "../common/Avatar";
import PostEntry from "./PostEntry";
import PrivacyIcon from "./PrivacyIcon";

const PostHeader = ({ post }) => {
    const [showAction, setShowAction] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { auth } = useAuth();
    const isMe = post?.author?.id === auth?.user?.id;
    const profileLink = `/${post?.author?.username}`;
    const { dispatch } = usePost();
    const { api } = useAxios();

    const handleDeletePost = async () => {
        if (!window.confirm("Delete this post?")) return;
        dispatch({ type: actions.post.DATA_FETCHING });
        try {
            const response = await api.delete(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}`,
            );
            if (response.status === 200) {
                dispatch({ type: actions.post.POST_DELETED, data: post.id });
                toast.success("Post deleted!");
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
            <header
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    }}
                >
                    <Link to={profileLink}>
                        <Avatar user={post?.author} size="md" />
                    </Link>
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                            }}
                        >
                            <Link
                                to={profileLink}
                                style={{
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    color: "var(--text-primary)",
                                    textDecoration: "none",
                                    transition: "color 150ms ease",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--text-primary)")
                                }
                            >
                                {post?.author?.name}
                            </Link>
                            <PrivacyIcon privacy={post?.privacy} />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                marginTop: "0.1rem",
                            }}
                        >
                            <svg
                                style={{
                                    width: 12,
                                    height: 12,
                                    color: "var(--text-muted)",
                                    flexShrink: 0,
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span
                                style={{
                                    fontSize: "0.78rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {getDateDifferenceFromNow(post?.createAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Three-dot menu */}
                {isMe && (
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <button
                            className="icon-btn"
                            style={{ width: 32, height: 32 }}
                            onClick={() => setShowAction(!showAction)}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="5" cy="12" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="19" cy="12" r="1.5" />
                            </svg>
                        </button>

                        {showAction && (
                            <div className="action-modal-container">
                                <button
                                    className="action-menu-item"
                                    onClick={() => {
                                        setShowEditModal(true);
                                        setShowAction(false);
                                    }}
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
                                    Edit Post
                                </button>
                                <button
                                    className="action-menu-item"
                                    style={{ color: "var(--danger)" }}
                                    onClick={() => {
                                        setShowAction(false);
                                        handleDeletePost();
                                    }}
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
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            {showEditModal && (
                <div
                    className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.75)" }}
                >
                    <div className="modal-content w-full max-w-xl">
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
