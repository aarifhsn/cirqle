/* PostAction.jsx — Cirqle v2
 * Changes from original:
 * - Replaced all hardcoded dark colors (#3F3F3F, bg-lighterDark, text-lwsGreen)
 *   with CSS variables — now works in BOTH dark and light mode
 * - Used .post-action CSS class from index.css for consistency
 * - Share dropdown theming updated
 * - All like/share/copy API logic 100% untouched
 */

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

const PostAction = ({ post, commentCount }) => {
    const { auth } = useAuth();
    const [liked, setLiked] = useState(post?.likes?.includes(auth?.user?.id));
    const [likeCount, setLikeCount] = useState(post?.likes?.length ?? 0);
    const [showShare, setShowShare] = useState(false);
    const shareRef = useRef(null);
    const { api } = useAxios();

    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const postText = encodeURIComponent(post?.content?.slice(0, 100) ?? "");
    const encodedUrl = encodeURIComponent(postUrl);

    /* ── Original logic untouched ────────────────────────────── */
    useEffect(() => {
        const handler = (e) => {
            if (shareRef.current && !shareRef.current.contains(e.target))
                setShowShare(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

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
            toast.error(
                error.response?.data?.message || "Failed to update like.",
            );
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied!");
        setShowShare(false);
    };

    const shareOptions = [
        {
            label: "WhatsApp",
            emoji: "💬",
            href: `https://wa.me/?text=${postText}%20${encodedUrl}`,
        },
        {
            label: "Gmail",
            emoji: "📧",
            href: `https://mail.google.com/mail/?view=cm&body=${postText}%20${encodedUrl}`,
        },
        {
            label: "Facebook",
            emoji: "👥",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            label: "X (Twitter)",
            emoji: "🐦",
            href: `https://twitter.com/intent/tweet?text=${postText}&url=${encodedUrl}`,
        },
    ];

    return (
        <div
            className="flex items-center gap-0.5 py-1 my-1"
            style={{
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            {/* ── Like ──────────────────────────────────────────── */}
            <button
                onClick={handleLike}
                className="post-action flex-1 justify-center"
                style={
                    liked
                        ? {
                              color: "var(--danger)",
                              background: "var(--danger-soft)",
                          }
                        : {}
                }
            >
                {liked ? (
                    <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                ) : (
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
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                )}
                <span>{liked ? "Liked" : "Like"}</span>
                {likeCount > 0 && (
                    <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                            background: liked
                                ? "var(--danger-soft)"
                                : "var(--bg-surface-2)",
                            color: liked
                                ? "var(--danger)"
                                : "var(--text-muted)",
                        }}
                    >
                        {likeCount}
                    </span>
                )}
            </button>

            {/* ── Comment ───────────────────────────────────────── */}
            <button className="post-action flex-1 justify-center">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                <span>Comment</span>
                {commentCount > 0 && (
                    <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                            background: "var(--bg-surface-2)",
                            color: "var(--text-muted)",
                        }}
                    >
                        {commentCount}
                    </span>
                )}
            </button>

            {/* ── Share ─────────────────────────────────────────── */}
            <div className="relative ml-auto" ref={shareRef}>
                <button
                    onClick={() => setShowShare(!showShare)}
                    className="post-action"
                    style={
                        showShare
                            ? {
                                  color: "var(--accent)",
                                  background: "var(--accent-soft)",
                              }
                            : {}
                    }
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
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                    <span>Share</span>
                </button>

                {/* Share dropdown */}
                {showShare && (
                    <div
                        className="absolute right-0 bottom-full mb-2 w-44 rounded-2xl overflow-hidden z-20 animate-fade-in-scale"
                        style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-strong)",
                            boxShadow: "var(--card-shadow-hover)",
                        }}
                    >
                        <p
                            className="text-xs px-3 pt-2.5 pb-1 uppercase tracking-wider font-semibold"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Share via
                        </p>

                        {shareOptions.map((opt) => (
                            <a
                                key={opt.label}
                                href={opt.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowShare(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors"
                                style={{ color: "var(--text-secondary)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "var(--hover-bg)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        "transparent")
                                }
                            >
                                <span>{opt.emoji}</span>
                                {opt.label}
                            </a>
                        ))}

                        <div
                            className="divider"
                            style={{ margin: "0.25rem 0" }}
                        />

                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "var(--hover-bg)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "transparent")
                            }
                        >
                            <span>🔗</span>
                            Copy Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostAction;
