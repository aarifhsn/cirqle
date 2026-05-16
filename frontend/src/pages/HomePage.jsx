import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { actions } from "../actions";
import NewPost from "../components/posts/NewPost";
import PostList from "../components/posts/PostList";
import useAxios from "../hooks/useAxios";
import { usePost } from "../hooks/usePost";
import AppLayout from "../layouts/AppLayout";

const FEED_TABS = [
    { id: "public", label: "For You", icon: "✦", usesPostFeed: true },
    { id: "following", label: "Following", icon: "◯", usesPostFeed: true },
    { id: "nearby", label: "Nearby", icon: "⌖", usesPostFeed: true },
    { id: "circles", label: "Circles", icon: "◎", usesPostFeed: true },
    { id: "events", label: "Events", icon: "◷", usesPostFeed: false },
    { id: "jobs", label: "Jobs", icon: "◧", usesPostFeed: false },
];

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
                    className="skeleton"
                    style={{ height: 180, borderRadius: 12 }}
                />
            </div>
        ))}
    </div>
);

const EmptyFeed = ({ tab }) => {
    const t = FEED_TABS.find((t) => t.id === tab);
    return (
        <div
            className="card flex-center flex-col"
            style={{ padding: "4rem 2rem", textAlign: "center" }}
        >
            <div
                className="flex-center mb-4"
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--accent-soft)",
                }}
            >
                <span style={{ fontSize: "1.75rem" }}>{t?.icon ?? "📭"}</span>
            </div>
            <h3
                className="font-semibold mb-1"
                style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}
            >
                Nothing here yet
            </h3>
            <p
                className="text-sm"
                style={{ color: "var(--text-muted)", maxWidth: 260 }}
            >
                {tab === "following"
                    ? "Follow people to see their posts here."
                    : tab === "nearby"
                      ? "No posts from people nearby yet."
                      : tab === "circles"
                        ? "Join circles to see posts here."
                        : "Check back soon!"}
            </p>
        </div>
    );
};

const FeedError = ({ message, onRetry }) => (
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
            Failed to load. {message}
        </p>
        <button onClick={onRetry} className="btn btn-ghost btn-sm">
            Try again
        </button>
    </div>
);

const EventsTab = () => {
    const { api } = useAxios();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/events`)
            .then((r) => {
                setEvents(r.data?.data ?? r.data ?? []);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <FeedSkeleton />;
    if (error)
        return <FeedError message={error} onRetry={() => setLoading(true)} />;
    if (events.length === 0) return <EmptyFeed tab="events" />;

    return (
        <div className="flex flex-col gap-3">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
};

const EventCard = ({ event }) => (
    <div className="card card-hover" style={{ padding: "1.25rem 1.4rem" }}>
        {/* Cover image */}
        {event.cover_image && (
            <img
                src={`${import.meta.env.VITE_STORAGE_URL}/${event.cover_image}`}
                alt={event.title}
                className="w-full object-cover mb-3"
                style={{ height: 160, borderRadius: 12 }}
            />
        )}

        {/* Header row */}
        <div className="flex items-start gap-3">
            {/* Date block */}
            <div
                className="flex-center flex-col flex-shrink-0"
                style={{
                    width: 48,
                    height: 52,
                    borderRadius: 10,
                    background: "var(--accent-soft)",
                    border: "1px solid var(--accent)",
                }}
            >
                <span
                    style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    {event.start_date
                        ? new Date(event.start_date).toLocaleString("en", {
                              month: "short",
                          })
                        : "TBD"}
                </span>
                <span
                    style={{
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--accent)",
                        lineHeight: 1,
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {event.start_date
                        ? new Date(event.start_date).getDate()
                        : "—"}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <h4
                    className="font-bold mb-1 truncate"
                    style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {event.title}
                </h4>
                {event.location && (
                    <p
                        className="text-xs mb-1 flex items-center gap-1"
                        style={{ color: "var(--text-muted)" }}
                    >
                        📍 {event.location}
                    </p>
                )}
                {event.start_date && (
                    <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        🕐{" "}
                        {new Date(event.start_date).toLocaleString("en", {
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                )}
            </div>

            {/* Attendees */}
            {event.attendees_count > 0 && (
                <span className="pill pill-accent flex-shrink-0">
                    {event.attendees_count} going
                </span>
            )}
        </div>

        {/* Description */}
        {event.description && (
            <p
                className="text-sm mt-3 leading-relaxed line-clamp-2"
                style={{ color: "var(--text-secondary)" }}
            >
                {event.description}
            </p>
        )}

        {/* Footer */}
        <div
            className="flex items-center justify-between mt-4 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
        >
            <span className="pill pill-muted text-xs">
                {event.category ?? "Event"}
            </span>
            <button className="btn btn-primary btn-sm">RSVP</button>
        </div>
    </div>
);

const JobsTab = () => {
    const { api } = useAxios();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/jobs`)
            .then((r) => {
                setJobs(r.data?.data ?? r.data ?? []);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <FeedSkeleton />;
    if (error)
        return <FeedError message={error} onRetry={() => setLoading(true)} />;
    if (jobs.length === 0) return <EmptyFeed tab="jobs" />;

    return (
        <div className="flex flex-col gap-3">
            {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
};

const JobCard = ({ job }) => (
    <div className="card card-hover" style={{ padding: "1.25rem 1.4rem" }}>
        <div className="flex items-start gap-3">
            {/* Company logo / icon */}
            <div
                className="flex-center flex-shrink-0"
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "var(--accent-soft)",
                    fontSize: "1.4rem",
                    border: "1px solid var(--border)",
                }}
            >
                {job.company_logo ? (
                    <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${job.company_logo}`}
                        alt={job.company}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    "💼"
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4
                    className="font-bold mb-0.5 truncate"
                    style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {job.title}
                </h4>
                <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {job.company}
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {job.location && (
                        <span className="pill pill-muted">
                            📍 {job.location}
                        </span>
                    )}
                    {job.type && (
                        <span className="pill pill-accent">{job.type}</span>
                    )}
                    {job.salary && (
                        <span className="pill pill-success">
                            💵 {job.salary}
                        </span>
                    )}
                </div>
            </div>

            {/* Posted time */}
            {job.created_at && (
                <p
                    className="text-xs flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                >
                    {new Date(job.created_at).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                    })}
                </p>
            )}
        </div>

        {/* Description */}
        {job.description && (
            <p
                className="text-sm mt-3 leading-relaxed line-clamp-2"
                style={{ color: "var(--text-secondary)" }}
            >
                {job.description}
            </p>
        )}

        {/* Tags */}
        {job.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
                {job.tags.slice(0, 4).map((tag) => (
                    <span
                        key={tag}
                        className="pill pill-muted"
                        style={{ fontSize: "0.7rem" }}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        )}

        {/* Footer */}
        <div
            className="flex items-center justify-between mt-4 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
        >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Posted by{" "}
                <Link
                    to={`/${job.poster?.username}`}
                    className="font-medium"
                    style={{ color: "var(--accent)" }}
                >
                    {job.poster?.name ?? job.poster?.firstName}
                </Link>
            </p>
            <button className="btn btn-primary btn-sm">Apply Now</button>
        </div>
    </div>
);

const HomePage = () => {
    const { state, dispatch } = usePost();
    const { api } = useAxios();
    const [activeTab, setActiveTab] = useState("public");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef(null);

    const currentTabMeta = FEED_TABS.find((t) => t.id === activeTab);

    /* ── Post-feed fetch (public / following / nearby / circles) ─ */
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

    /* ── Reset + fetch when tab changes (post-feed tabs only) ──── */
    useEffect(() => {
        if (!currentTabMeta?.usesPostFeed) return;
        setPage(1);
        setHasMore(true);
        dispatch({ type: actions.post.DATA_FETCHING }); // ← clears previous error
        fetchPosts(1, activeTab, false);
    }, [activeTab]);

    /* ── Infinite scroll (post-feed tabs only) ───────────────────  */
    useEffect(() => {
        if (!currentTabMeta?.usesPostFeed) return;
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
    }, [
        hasMore,
        loadingMore,
        state?.loading,
        activeTab,
        fetchPosts,
        currentTabMeta,
    ]);

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

            {/* ── Post count (post-feed tabs) ───────────────────── */}
            {currentTabMeta?.usesPostFeed &&
                !state?.loading &&
                state?.posts?.length > 0 && (
                    <p
                        className="text-xs px-1"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {state.posts.length} posts
                    </p>
                )}

            {/* ── Events tab ────────────────────────────────────── */}
            {activeTab === "events" && <EventsTab />}

            {/* ── Jobs tab ──────────────────────────────────────── */}
            {activeTab === "jobs" && <JobsTab />}

            {/* ── Post feed tabs (public/following/nearby/circles) ─ */}
            {currentTabMeta?.usesPostFeed && (
                <>
                    {state?.loading && <FeedSkeleton />}
                    {!state?.loading && state?.error && (
                        <FeedError
                            message={state.error}
                            onRetry={() => fetchPosts(1, activeTab, false)}
                        />
                    )}
                    {!state?.loading &&
                        !state?.error &&
                        state?.posts?.length === 0 && (
                            <EmptyFeed tab={activeTab} />
                        )}
                    {!state?.loading &&
                        !state?.error &&
                        state?.posts?.length > 0 && (
                            <PostList posts={state.posts} />
                        )}

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-4" />

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
                            Loading more posts…
                        </div>
                    )}

                    {!hasMore && !loadingMore && state?.posts?.length > 0 && (
                        <p
                            className="text-center text-sm py-6"
                            style={{ color: "var(--text-muted)" }}
                        >
                            You're all caught up ✨
                        </p>
                    )}
                </>
            )}
        </AppLayout>
    );
};

export default HomePage;
