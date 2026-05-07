import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

const PostAction = ({ post, commentCount }) => {
    const { auth } = useAuth();
    const [liked, setLiked] = useState(post?.likes?.includes(auth?.user?.id));
    const [likeCount, setLikeCount] = useState(post?.likes?.length ?? 0);
    const { api } = useAxios();

    const handleLike = async () => {
        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}/like`,
            );
            if (response.status === 200) {
                const nowLiked = !liked;
                setLiked(nowLiked);
                setLikeCount((prev) => (nowLiked ? prev + 1 : prev - 1));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update like!");
        }
    };

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/posts/${post.id}`;
        if (navigator.share) {
            await navigator.share({ title: "Check this post", url: postUrl });
        } else {
            await navigator.clipboard.writeText(postUrl);
            toast.success("Link copied!");
        }
    };

    const btnBase = {
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 0.875rem",
        borderRadius: "var(--r-full)",
        border: "1px solid transparent",
        background: "transparent",
        cursor: "pointer",
        fontSize: "0.82rem",
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 150ms ease",
        color: "var(--text-secondary)",
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.5rem 0",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                margin: "0.75rem 0",
            }}
        >
            {/* Like */}
            <button
                style={{
                    ...btnBase,
                    color: liked ? "var(--accent)" : "var(--text-secondary)",
                    background: liked ? "var(--accent-soft)" : "transparent",
                    border: liked
                        ? "1px solid rgba(0,217,145,0.2)"
                        : "1px solid transparent",
                }}
                onClick={handleLike}
                onMouseEnter={(e) => {
                    if (!liked)
                        e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                    if (!liked)
                        e.currentTarget.style.background = "transparent";
                }}
            >
                {liked ? (
                    <svg
                        style={{ width: 16, height: 16, fill: "var(--accent)" }}
                        viewBox="0 0 24 24"
                    >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                ) : (
                    <svg
                        style={{ width: 16, height: 16 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                )}
                {liked ? "Liked" : "Like"}
                {likeCount > 0 && (
                    <span
                        style={{
                            background: liked
                                ? "rgba(0,217,145,0.2)"
                                : "var(--bg-elevated)",
                            color: liked
                                ? "var(--accent)"
                                : "var(--text-muted)",
                            borderRadius: "var(--r-full)",
                            padding: "0 0.375rem",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                        }}
                    >
                        {likeCount}
                    </span>
                )}
            </button>

            {/* Comment count */}
            <button
                style={{ ...btnBase }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                }}
            >
                <svg
                    style={{ width: 16, height: 16 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                Comment
                {commentCount > 0 && (
                    <span
                        style={{
                            background: "var(--bg-elevated)",
                            color: "var(--text-muted)",
                            borderRadius: "var(--r-full)",
                            padding: "0 0.375rem",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                        }}
                    >
                        {commentCount}
                    </span>
                )}
            </button>

            {/* Share — pushed right */}
            <button
                style={{ ...btnBase, marginLeft: "auto" }}
                onClick={handleShare}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                }}
            >
                <svg
                    style={{ width: 16, height: 16 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
                Share
            </button>
        </div>
    );
};

export default PostAction;
