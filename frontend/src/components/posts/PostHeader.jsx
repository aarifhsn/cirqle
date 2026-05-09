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

    /* ── All original API logic untouched ────────────────────── */
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
            const message =
                error.response?.data?.message || "Failed to delete post!";
            toast.error(message);
            dispatch({
                type: actions.post.DATA_FETCH_ERROR,
                error: error.message,
            });
        }
    };

    return (
        <>
            <header className="flex items-start justify-between gap-3 mb-3">
                {/* ── Left: Avatar + name + time ────────────────── */}
                <div className="flex items-center gap-3">
                    <Link to={profileLink} className="flex-shrink-0">
                        <Avatar user={post?.author} size="md" />
                    </Link>

                    <div>
                        {/* Name + privacy */}
                        <div className="flex items-center gap-1.5">
                            <Link
                                to={profileLink}
                                className="font-semibold text-sm transition-colors"
                                style={{ color: "var(--text-primary)" }}
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

                        {/* Timestamp */}
                        <div
                            className="flex items-center gap-1 mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <svg
                                className="w-3 h-3 flex-shrink-0"
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
                            <span className="text-xs">
                                {getDateDifferenceFromNow(post?.createAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Right: 3-dot menu (only for own posts) ────── */}
                {isMe && (
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowAction(!showAction)}
                            className="btn btn-ghost btn-icon"
                            aria-label="Post options"
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

                        {/* Dropdown */}
                        {showAction && (
                            <div
                                className="absolute right-0 top-10 z-30 w-44 rounded-2xl overflow-hidden animate-fade-in-scale"
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border-strong)",
                                    boxShadow: "var(--card-shadow-hover)",
                                }}
                            >
                                {/* Edit */}
                                <button
                                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors"
                                    style={{ color: "var(--text-secondary)" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            "var(--hover-bg)";
                                        e.currentTarget.style.color =
                                            "var(--accent)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            "transparent";
                                        e.currentTarget.style.color =
                                            "var(--text-secondary)";
                                    }}
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

                                <div
                                    className="divider"
                                    style={{ margin: "0" }}
                                />

                                {/* Delete */}
                                <button
                                    className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors"
                                    style={{ color: "var(--danger)" }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "var(--danger-soft)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                            "transparent")
                                    }
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

            {/* ── Edit Modal (unchanged) ─────────────────────────── */}
            {showEditModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "var(--bg-overlay)" }}
                >
                    <div className="w-full max-w-xl animate-fade-in-scale">
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
