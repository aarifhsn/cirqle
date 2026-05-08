import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/common/Avatar";
import PageLayout from "../components/common/PageLayout";
import useAxios from "../hooks/useAxios";
import { getDateDifferenceFromNow } from "../utils";

const NotificationSkeleton = () => (
    <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
                <div className="w-11 h-11 rounded-full bg-lighterDark animate-pulse shrink-0" />
                <div className="flex-1">
                    <div className="h-3 w-48 bg-lighterDark rounded animate-pulse mb-2" />
                    <div className="h-2.5 w-24 bg-lighterDark rounded animate-pulse" />
                </div>
            </div>
        ))}
    </div>
);

const NotificationIcon = ({ type }) => {
    if (type === "post_liked")
        return (
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <svg
                    className="w-4 h-4 text-red-400 fill-red-400"
                    viewBox="0 0 24 24"
                >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
        );

    if (type === "post_commented")
        return (
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg
                    className="w-4 h-4 text-blue-400"
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
            </div>
        );

    if (type === "user_followed")
        return (
            <div className="w-8 h-8 rounded-full bg-lwsGreen/20 flex items-center justify-center shrink-0">
                <svg
                    className="w-4 h-4 text-lwsGreen"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                </svg>
            </div>
        );

    return null;
};

const NotificationsPage = () => {
    const { api } = useAxios();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [markingRead, setMarkingRead] = useState(false);
    const sentinelRef = useRef(null);

    const fetchNotifications = useCallback(
        async (pageNum, append = false) => {
            if (append) setLoadingMore(true);

            try {
                const res = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/notifications?page=${pageNum}`,
                );
                const { data, unread_count, has_more } = res.data;
                setHasMore(has_more);
                setUnreadCount(unread_count);
                setNotifications((prev) =>
                    append ? [...prev, ...data] : data,
                );
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [api],
    );

    useEffect(() => {
        fetchNotifications(1, false);
    }, []);

    // infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setPage((prev) => {
                        const next = prev + 1;
                        fetchNotifications(next, true);
                        return next;
                    });
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, fetchNotifications]);

    const handleMarkAllRead = async () => {
        setMarkingRead(true);
        try {
            await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/notifications/mark-all-read`,
            );
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() })),
            );
            setUnreadCount(0);
        } catch (e) {
            console.error(e);
        } finally {
            setMarkingRead(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/notifications/${id}/mark-read`,
            );
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <PageLayout>
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                {unreadCount} unread
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            disabled={markingRead}
                            className="text-xs text-lwsGreen hover:underline disabled:opacity-50 transition-all"
                        >
                            {markingRead ? "Marking..." : "Mark all as read"}
                        </button>
                    )}
                </div>

                {/* Skeleton */}
                {loading && <NotificationSkeleton />}

                {/* Empty */}
                {!loading && notifications.length === 0 && (
                    <div className="card flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-full bg-lwsGreen/10 flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-lwsGreen"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </div>
                        <p className="text-white font-semibold mb-1">
                            No notifications yet
                        </p>
                        <p className="text-gray-500 text-sm">
                            We'll notify you when something happens
                        </p>
                    </div>
                )}

                {/* List */}
                {!loading && notifications.length > 0 && (
                    <div className="space-y-2">
                        {notifications.map((n) => {
                            const data = n.data;
                            const isUnread = !n.read_at;
                            const profileLink = `/${data.actor_username ?? "users/" + data.actor_id}`;
                            const postLink = data.post_id
                                ? `/posts/${data.post_id}`
                                : null;

                            return (
                                <div
                                    key={n.id}
                                    onClick={() =>
                                        isUnread && handleMarkRead(n.id)
                                    }
                                    className={`card flex items-start gap-3 p-4 cursor-pointer transition-all hover:border-[#3F3F3F] ${
                                        isUnread
                                            ? "border-l-2 border-l-lwsGreen"
                                            : ""
                                    }`}
                                >
                                    {/* Unread dot */}
                                    <div className="relative shrink-0 mt-0.5">
                                        <Link to={profileLink}>
                                            <Avatar
                                                user={{
                                                    firstName:
                                                        data.actor_name?.split(
                                                            " ",
                                                        )[0],
                                                    lastName:
                                                        data.actor_name?.split(
                                                            " ",
                                                        )[1],
                                                    avatar: data.actor_avatar,
                                                }}
                                                size="md"
                                            />
                                        </Link>
                                        {isUnread && (
                                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lwsGreen border-2 border-[#1E1F24]" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white leading-snug">
                                            <Link
                                                to={profileLink}
                                                className="font-semibold hover:text-lwsGreen transition-all"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {data.actor_name}
                                            </Link>{" "}
                                            <span className="text-gray-300">
                                                {data.type === "post_liked" &&
                                                    "liked your post"}
                                                {data.type ===
                                                    "post_commented" && (
                                                    <>
                                                        commented:{" "}
                                                        <span className="text-gray-400 italic">
                                                            "
                                                            {data.comment?.slice(
                                                                0,
                                                                50,
                                                            )}
                                                            {data.comment
                                                                ?.length > 50
                                                                ? "..."
                                                                : ""}
                                                            "
                                                        </span>
                                                    </>
                                                )}
                                                {data.type ===
                                                    "user_followed" &&
                                                    "started following you"}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {getDateDifferenceFromNow(
                                                n.created_at,
                                            )}{" "}
                                            ago
                                        </p>
                                    </div>

                                    {/* Type icon */}
                                    <NotificationIcon type={data.type} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Sentinel */}
                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
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
                        Loading...
                    </div>
                )}

                {!hasMore && notifications.length > 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                        You're all caught up ✓
                    </p>
                )}
            </div>
        </PageLayout>
    );
};

export default NotificationsPage;
