import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import PostList from "../posts/PostList";

const MyPosts = () => {
    const { state } = useProfile();
    const { auth } = useAuth();
    const posts = state?.posts;
    const isMe = Number(state?.user?.id) === Number(auth?.user?.id);

    return (
        <div style={{ marginTop: "1.25rem" }}>
            {/* Section header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <h4
                    style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <svg
                        style={{
                            width: 18,
                            height: 18,
                            color: "var(--accent)",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                    </svg>
                    {isMe
                        ? "My Posts"
                        : `${state?.user?.firstName ?? "User"}'s Posts`}
                </h4>

                {posts?.length > 0 && (
                    <span
                        className="badge badge-accent"
                        style={{ fontSize: "0.72rem" }}
                    >
                        {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </span>
                )}
            </div>

            {/* Content */}
            {!posts ? (
                /* Loading skeleton */
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="card"
                            style={{ padding: "1.25rem 1.5rem" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                <div
                                    className="skeleton"
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        flexShrink: 0,
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div
                                        className="skeleton"
                                        style={{
                                            height: 12,
                                            width: "40%",
                                            marginBottom: 8,
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
                                className="skeleton"
                                style={{
                                    height: 12,
                                    width: "100%",
                                    marginBottom: 8,
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
            ) : posts.length === 0 ? (
                /* Empty state */
                <div
                    className="card"
                    style={{
                        padding: "3.5rem 2rem",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: "var(--accent-soft)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "1rem",
                        }}
                    >
                        <svg
                            style={{
                                width: 24,
                                height: 24,
                                color: "var(--accent)",
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </div>
                    <h5
                        style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginBottom: "0.4rem",
                        }}
                    >
                        No posts yet
                    </h5>
                    <p
                        style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            maxWidth: 240,
                        }}
                    >
                        {isMe
                            ? "Share your first thought with the world."
                            : `${state?.user?.firstName ?? "This user"} hasn't posted anything yet.`}
                    </p>
                </div>
            ) : (
                <PostList posts={posts} />
            )}
        </div>
    );
};

export default MyPosts;
