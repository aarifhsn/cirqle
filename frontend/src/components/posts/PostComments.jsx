/* PostComments.jsx — Cirqle v2
 * Changes:
 * - bg-lighterDark → var(--input-bg) on comment input
 * - bg-slate-400 dark:bg-lighterDark → var(--input-bg)
 * - text-lwsGreen → var(--accent)
 * - border-[#3F3F3F] → var(--border)
 * - All comment/reply API logic 100% untouched
 */

import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "../common/Avatar";
import PostCommentList from "./PostCommentList";

const PostComments = ({ post }) => {
    const { auth } = useAuth();
    const { api } = useAxios();
    const [comments, setComments] = useState(post?.comments ?? []);
    const [comment, setComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const COMMENTS_PER_PAGE = 3;
    const visibleComments = showAll
        ? comments
        : comments.slice(0, COMMENTS_PER_PAGE);

    /* ── Original logic untouched ────────────────────────────── */
    const addComment = async (e) => {
        if (e.keyCode !== 13 || !comment.trim()) return;
        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}/comment`,
                { comment, parent_id: replyingTo?.id ?? null },
            );
            if (response.status === 200) {
                setComments(response.data.comments);
                setComment("");
                setReplyingTo(null);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to add comment!",
            );
        }
    };

    return (
        <div>
            {/* Show more / less toggle */}
            {comments.length > COMMENTS_PER_PAGE && (
                <button
                    className="text-sm mb-3 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--accent)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-muted)")
                    }
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? "Show less ▴"
                        : `View all ${comments.length} comments ▾`}
                </button>
            )}

            <PostCommentList
                comments={visibleComments}
                onReply={(id, name) => {
                    setReplyingTo({ id, name });
                    setComment(`@${name} `);
                }}
            />

            {/* Comment input */}
            <div
                className="flex items-center gap-2 mt-3 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
            >
                <Avatar user={auth?.user} size="sm" />
                <div className="flex-1">
                    {/* Replying to indicator */}
                    {replyingTo && (
                        <div
                            className="flex items-center gap-2 mb-1 text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <span>
                                Replying to{" "}
                                <span style={{ color: "var(--accent)" }}>
                                    {replyingTo.name}
                                </span>
                            </span>
                            <button
                                onClick={() => {
                                    setReplyingTo(null);
                                    setComment("");
                                }}
                                className="transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--text-primary)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--text-muted)")
                                }
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <input
                        type="text"
                        className="w-full text-xs px-4 rounded-full outline-none transition-all"
                        style={{
                            height: 36,
                            background: "var(--input-bg)",
                            border: "1.5px solid var(--border)",
                            color: "var(--text-primary)",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.background =
                                "var(--input-bg-focus)";
                            e.currentTarget.style.boxShadow =
                                "0 0 0 3px var(--accent-soft)";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background =
                                "var(--input-bg)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={addComment}
                        placeholder={
                            replyingTo
                                ? `Reply to ${replyingTo.name}…`
                                : "Write a comment and press Enter…"
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default PostComments;
