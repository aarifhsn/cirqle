import { useEffect, useState } from "react";
import { actions } from "../actions";
import PageLayout from "../components/common/PageLayout";
import NewPost from "../components/posts/NewPost";
import PostList from "../components/posts/PostList";
import useAxios from "../hooks/useAxios";
import { usePost } from "../hooks/usePost";

/* ── Feed skeleton ─────────────────────────────────── */
const FeedSkeleton = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem 1.5rem" }}>
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
                                height: 13,
                                width: "45%",
                                marginBottom: 8,
                                borderRadius: 6,
                            }}
                        />
                        <div
                            className="skeleton"
                            style={{
                                height: 11,
                                width: "28%",
                                borderRadius: 6,
                            }}
                        />
                    </div>
                </div>
                <div
                    className="skeleton"
                    style={{
                        height: 13,
                        width: "100%",
                        marginBottom: 8,
                        borderRadius: 6,
                    }}
                />
                <div
                    className="skeleton"
                    style={{
                        height: 13,
                        width: "75%",
                        borderRadius: 6,
                        marginBottom: 16,
                    }}
                />
                <div
                    className="skeleton"
                    style={{ height: 200, borderRadius: 10, marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: "1rem" }}>
                    <div
                        className="skeleton"
                        style={{ height: 32, width: 80, borderRadius: 20 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 32, width: 80, borderRadius: 20 }}
                    />
                    <div
                        className="skeleton"
                        style={{
                            height: 32,
                            width: 80,
                            borderRadius: 20,
                            marginLeft: "auto",
                        }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* ── Empty state ───────────────────────────────────── */
const EmptyFeed = ({ filter }) => (
    <div
        className="card flex-center flex-col"
        style={{ padding: "4rem 2rem", textAlign: "center" }}
    >
        <div
            style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
            }}
        >
            <svg
                style={{ width: 28, height: 28, color: "var(--accent)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
            </svg>
        </div>
        <h3
            style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
            }}
        >
            {filter === "following"
                ? "Your following feed is empty"
                : "No posts yet"}
        </h3>
        <p
            style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                maxWidth: 280,
            }}
        >
            {filter === "following"
                ? "Follow some people to see their posts here."
                : "Be the first to share something!"}
        </p>
    </div>
);

/* ── Error state ───────────────────────────────────── */
const FeedError = ({ message }) => (
    <div
        className="card"
        style={{
            padding: "2rem",
            textAlign: "center",
            background: "var(--danger-soft)",
            border: "1px solid rgba(255,77,109,0.2)",
        }}
    >
        <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>
            Failed to load posts. {message}
        </p>
        <button
            onClick={() => window.location.reload()}
            className="btn-ghost"
            style={{ marginTop: "1rem" }}
        >
            Try again
        </button>
    </div>
);

/* ── HomePage ──────────────────────────────────────── */
const HomePage = () => {
    const { state, dispatch } = usePost();
    const { api } = useAxios();
    const [filter, setFilter] = useState("public");

    useEffect(() => {
        dispatch({ type: actions.post.DATA_FETCHING });

        const fetchPost = async () => {
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts?filter=${filter}`,
                );
                if (response.status === 200) {
                    dispatch({
                        type: actions.post.DATA_FETCHED,
                        data: response.data,
                    });
                }
            } catch (error) {
                console.error(error);
                dispatch({
                    type: actions.post.DATA_FETCH_ERROR,
                    error: error.message,
                });
            }
        };

        fetchPost();
    }, [filter]);

    return (
        <PageLayout>
            {/* New post box */}
            <NewPost />

            {/* Feed filter */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "1rem 0 0.75rem",
                    justifyContent: "flex-end",
                }}
            >
                <span
                    style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginRight: "auto",
                    }}
                >
                    {!state?.loading && state?.posts?.length > 0
                        ? `${state.posts.length} posts`
                        : ""}
                </span>
                <button
                    onClick={() => setFilter("public")}
                    className={`filter-pill ${filter === "public" ? "active" : ""}`}
                >
                    🌐 Public
                </button>
                <button
                    onClick={() => setFilter("following")}
                    className={`filter-pill ${filter === "following" ? "active" : ""}`}
                >
                    👥 Following
                </button>
            </div>

            {/* Feed content */}
            {state?.loading && <FeedSkeleton />}
            {!state?.loading && state?.error && (
                <FeedError message={state.error} />
            )}
            {!state?.loading && !state?.error && state?.posts?.length === 0 && (
                <EmptyFeed filter={filter} />
            )}
            {!state?.loading && !state?.error && state?.posts?.length > 0 && (
                <PostList posts={state.posts} />
            )}
        </PageLayout>
    );
};

export default HomePage;
