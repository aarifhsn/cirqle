import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "../common/Avatar";
import PostCommentList from "./PostCommentList";

const COMMENTS_PER_PAGE = 2;

const PostComments = ({ post }) => {
    const { auth } = useAuth();
    const [comments, setComments] = useState(
        [...(post?.comments ?? [])].reverse(),
    );
    const [comment, setComment] = useState("");
    const [showAll, setShowAll] = useState(false);
    const { api } = useAxios();

    const visibleComments = showAll
        ? comments
        : comments.slice(0, COMMENTS_PER_PAGE);

    const addComment = async (event) => {
        if (event.keyCode !== 13 || !comment.trim()) return;
        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}/comment`,
                { comment },
            );
            if (response.status === 200) {
                setComments([...response.data.comments].reverse());
                setComment("");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment!");
        }
    };

    return (
        <div>
            {/* View all / less toggle */}
            {comments.length > COMMENTS_PER_PAGE && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: "0 0 0.75rem",
                        fontFamily: "'DM Sans', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                    }}
                >
                    <svg
                        style={{
                            width: 14,
                            height: 14,
                            transform: showAll
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 150ms ease",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                    {showAll
                        ? "Show less"
                        : `View all ${comments.length} comments`}
                </button>
            )}

            <PostCommentList comments={visibleComments} />

            {/* Comment input */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    marginTop: comments.length > 0 ? "0.875rem" : "0.25rem",
                }}
            >
                <Avatar user={auth?.user} size="sm" />
                <div style={{ flex: 1, position: "relative" }}>
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={addComment}
                        placeholder="Write a comment…"
                        style={{
                            width: "100%",
                            padding: "0.5rem 1rem",
                            paddingRight: "2.5rem",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--r-full)",
                            fontSize: "0.85rem",
                            color: "var(--text-primary)",
                            fontFamily: "'DM Sans', sans-serif",
                            outline: "none",
                            transition: "border-color 150ms ease",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor =
                                "var(--border-strong)";
                        }}
                        className="placeholder-[var(--text-muted)]"
                    />
                    <span
                        style={{
                            position: "absolute",
                            right: "0.75rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            pointerEvents: "none",
                        }}
                    >
                        ↵
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PostComments;
