/* MyPosts.jsx — Cirqle v2
 * Changes from original:
 * - All inline style objects → Tailwind + CSS vars hybrid
 * - badge class replaced with .pill.pill-accent
 * - Skeleton uses .skeleton CSS class (shimmer animation)
 * - Empty state uses CSS vars (dark/light safe)
 * - All logic (posts from state, isMe check) 100% untouched
 */

import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import PostList from "../posts/PostList";

const MyPosts = () => {
    const { state } = useProfile();
    const { auth } = useAuth();
    const posts = state?.posts;
    const isMe = Number(state?.user?.id) === Number(auth?.user?.id);

    return (
        <div className="mt-4 flex flex-col gap-3">
            {/* ── Section header ────────────────────────────────── */}
            <div
                className="flex items-center justify-between pb-3"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <h4
                    className="flex items-center gap-2 font-bold"
                    style={{
                        fontSize: "1rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    <span style={{ color: "var(--accent)" }}>📝</span>
                    {isMe
                        ? "My Posts"
                        : `${state?.user?.firstName ?? "User"}'s Posts`}
                </h4>

                {posts?.length > 0 && (
                    <span className="pill pill-accent">
                        {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </span>
                )}
            </div>

            {/* ── Loading skeleton ──────────────────────────────── */}
            {!posts && (
                <div className="flex flex-col gap-3">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="card"
                            style={{ padding: "1.25rem 1.4rem" }}
                        >
                            <div className="flex gap-3 mb-4">
                                <div
                                    className="skeleton flex-shrink-0"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                    }}
                                />
                                <div className="flex-1">
                                    <div
                                        className="skeleton mb-2"
                                        style={{
                                            height: 12,
                                            width: "40%",
                                            borderRadius: 6,
                                        }}
                                    />
                                    <div
                                        className="skeleton"
                                        style={{
                                            height: 10,
                                            width: "25%",
                                            borderRadius: 6,
                                        }}
                                    />
                                </div>
                            </div>
                            <div
                                className="skeleton mb-2"
                                style={{
                                    height: 12,
                                    width: "100%",
                                    borderRadius: 6,
                                }}
                            />
                            <div
                                className="skeleton"
                                style={{
                                    height: 12,
                                    width: "65%",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty state ───────────────────────────────────── */}
            {posts?.length === 0 && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "3.5rem 2rem", textAlign: "center" }}
                >
                    <div
                        className="flex-center mb-4"
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: "var(--accent-soft)",
                        }}
                    >
                        <span style={{ fontSize: "1.5rem" }}>📝</span>
                    </div>
                    <h5
                        className="font-semibold mb-1"
                        style={{
                            fontSize: "1rem",
                            color: "var(--text-primary)",
                        }}
                    >
                        No posts yet
                    </h5>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)", maxWidth: 240 }}
                    >
                        {isMe
                            ? "Share your first thought with the world."
                            : `${state?.user?.firstName ?? "This user"} hasn't posted anything yet.`}
                    </p>
                </div>
            )}

            {/* ── Post list ─────────────────────────────────────── */}
            {posts?.length > 0 && <PostList posts={posts} />}
        </div>
    );
};

export default MyPosts;
