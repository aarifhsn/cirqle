import { useCallback, useEffect, useRef, useState } from "react";
import { actions } from "../actions";
import NewPost from "../components/posts/NewPost";
import PostList from "../components/posts/PostList";
import useAxios from "../hooks/useAxios";
import { usePost } from "../hooks/usePost";
import AppLayout from "../layouts/AppLayout";

/* ── Feed tabs config ─────────────────────────────────────────── */
const FEED_TABS = [
    { id: "public", label: "For You", icon: "✨" },
    { id: "following", label: "Following", icon: "👥" },
    { id: "nearby", label: "Nearby", icon: "📍" },
    { id: "circles", label: "Circles", icon: "⭕" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "jobs", label: "Jobs", icon: "💼" },
];

/* ── Feed Skeleton (style only updated) ──────────────────────── */
const FeedSkeleton = () => (
    <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem 1.4rem" }}>
                <div className="flex gap-3 mb-4">
                    <div
                        className="skeleton flex-shrink-0"
                        style={{ width: 44, height: 44, borderRadius: "50%" }}
                    />
                    <div className="flex-1">
                        <div
                            className="skeleton mb-2"
                            style={{
                                height: 13,
                                width: "45%",
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
                    className="skeleton mb-2"
                    style={{ height: 13, width: "100%", borderRadius: 6 }}
                />
                <div
                    className="skeleton mb-4"
                    style={{ height: 13, width: "70%", borderRadius: 6 }}
                />
                <div
                    className="skeleton mb-4"
                    style={{ height: 200, borderRadius: 12 }}
                />
                <div className="flex gap-3">
                    <div
                        className="skeleton"
                        style={{ height: 34, width: 90, borderRadius: 20 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 34, width: 90, borderRadius: 20 }}
                    />
                    <div
                        className="skeleton ml-auto"
                        style={{ height: 34, width: 90, borderRadius: 20 }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* ── Empty state ──────────────────────────────────────────────── */
const EmptyFeed = ({ tab }) => (
    <div
        className="card flex-center flex-col"
        style={{ padding: "4rem 2rem", textAlign: "center" }}
    >
        <div
            className="flex-center mb-5"
            style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--accent-soft)",
            }}
        >
            <span style={{ fontSize: "1.75rem" }}>
                {FEED_TABS.find((t) => t.id === tab)?.icon ?? "📭"}
            </span>
        </div>
        <h3
            className="font-semibold mb-1"
            style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}
        >
            {tab === "following"
                ? "Your following feed is empty"
                : "Nothing here yet"}
        </h3>
        <p
            className="text-sm"
            style={{ color: "var(--text-muted)", maxWidth: 260 }}
        >
            {tab === "following"
                ? "Follow people to see their posts here."
                : "Be the first to post something!"}
        </p>
    </div>
);

/* ── Error state ──────────────────────────────────────────────── */
const FeedError = ({ message }) => (
    <div
        className="card"
        style={{
            padding: "2rem",
            textAlign: "center",
            background: "var(--danger-soft)",
            border: "1px solid rgba(239,68,68,0.2)",
        }}
    >
        <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>
            Failed to load posts. {message}
        </p>
        <button
            onClick={() => window.location.reload()}
            className="btn btn-ghost btn-sm"
        >
            Try again
        </button>
    </div>
);

/* ── HomePage ─────────────────────────────────────────────────── */
const HomePage = () => {
    const { state, dispatch } = usePost();
    const { api } = useAxios();
    const [activeTab, setActiveTab] = useState("public");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef(null);

    /* ── Original fetchPosts logic — untouched ────────────────── */
    const fetchPosts = useCallback(
        async (pageNum, currentFilter, append = false) => {
            if (append) {
                setLoadingMore(true);
            } else {
                dispatch({ type: actions.post.DATA_FETCHING });
            }
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts?filter=${currentFilter}&page=${pageNum}`,
                );
                if (response.status === 200) {
                    const { data, has_more } = response.data;
                    setHasMore(has_more);
                    dispatch({
                        type: append
                            ? actions.post.DATA_APPENDED
                            : actions.post.DATA_FETCHED,
                        data,
                    });
                }
            } catch (error) {
                dispatch({
                    type: actions.post.DATA_FETCH_ERROR,
                    error: error.message,
                });
            } finally {
                setLoadingMore(false);
            }
        },
        [api],
    );

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchPosts(1, activeTab, false);
    }, [activeTab]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !loadingMore &&
                    !state?.loading
                ) {
                    setPage((prev) => {
                        const next = prev + 1;
                        fetchPosts(next, activeTab, true);
                        return next;
                    });
                }
            },
            { threshold: 0.1 },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, state?.loading, activeTab, fetchPosts]);

    return (
        <AppLayout>
            {/* ── Composer ──────────────────────────────────────── */}
            <NewPost />

            {/* ── Feed Tabs ─────────────────────────────────────── */}
            <div className="feed-tabs">
                {FEED_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`feed-tab ${activeTab === tab.id ? "active" : ""}`}
                    >
                        <span>{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Post count label ──────────────────────────────── */}
            {!state?.loading && state?.posts?.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {state.posts.length} posts
                </p>
            )}

            {/* ── Feed content ──────────────────────────────────── */}
            {state?.loading && <FeedSkeleton />}

            {!state?.loading && state?.error && (
                <FeedError message={state.error} />
            )}

            {!state?.loading && !state?.error && state?.posts?.length === 0 && (
                <EmptyFeed tab={activeTab} />
            )}

            {!state?.loading && !state?.error && state?.posts?.length > 0 && (
                <PostList posts={state.posts} />
            )}

            {/* ── Infinite scroll sentinel ──────────────────────── */}
            <div ref={sentinelRef} className="h-4" />

            {/* ── Loading more ──────────────────────────────────── */}
            {loadingMore && (
                <div
                    className="flex items-center justify-center gap-2 py-6 text-sm"
                    style={{ color: "var(--text-muted)" }}
                >
                    <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                        />
                    </svg>
                    Loading more posts...
                </div>
            )}

            {/* ── End of feed ───────────────────────────────────── */}
            {!hasMore && !loadingMore && state?.posts?.length > 0 && (
                <p
                    className="text-center text-sm py-6"
                    style={{ color: "var(--text-muted)" }}
                >
                    You're all caught up ✨
                </p>
            )}
        </AppLayout>
    );
};

export default HomePage;
