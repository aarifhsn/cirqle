/* NotificationsPage.jsx — Cirqle v2
 * Changes:
 * - PageLayout → AppLayout
 * - bg-lighterDark, text-lwsGreen, text-white, text-gray-* → CSS vars
 * - NotificationIcon uses CSS vars for colors
 * - Unread dot border uses CSS var
 * - All API / infinite scroll logic 100% untouched
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/common/Avatar";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";
import { getDateDifferenceFromNow } from "../utils";

/* ── Skeleton ─────────────────────────────────────────────────── */
const NotificationSkeleton = () => (
    <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
                <div
                    className="skeleton flex-shrink-0"
                    style={{ width: 44, height: 44, borderRadius: "50%" }}
                />
                <div className="flex-1">
                    <div
                        className="skeleton mb-2"
                        style={{ height: 12, width: "55%", borderRadius: 6 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 10, width: "30%", borderRadius: 6 }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* ── Notification type icon ───────────────────────────────────── */
const NotificationIcon = ({ type }) => {
    const configs = {
        post_liked: { emoji: "❤️", bg: "var(--danger-soft)" },
        post_commented: { emoji: "💬", bg: "var(--info-soft)" },
        user_followed: { emoji: "👤", bg: "var(--success-soft)" },
    };
    const config = configs[type] ?? { emoji: "🔔", bg: "var(--accent-soft)" };

    return (
        <div
            className="flex-center flex-shrink-0"
            style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: config.bg,
                fontSize: "0.875rem",
            }}
        >
            {config.emoji}
        </div>
    );
};

/* ── NotificationsPage ────────────────────────────────────────── */
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

    /* ── Original API logic untouched ────────────────────────── */
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
        <AppLayout>
            {/* ── Page header ───────────────────────────────────── */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: "1.25rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        🔔 Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {unreadCount} unread
                        </p>
                    )}
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markingRead}
                        className="text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ color: "var(--accent)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.textDecoration = "none")
                        }
                    >
                        {markingRead ? "Marking…" : "Mark all as read"}
                    </button>
                )}
            </div>

            {/* ── Skeleton ──────────────────────────────────────── */}
            {loading && <NotificationSkeleton />}

            {/* ── Empty state ───────────────────────────────────── */}
            {!loading && notifications.length === 0 && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
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
                        <span style={{ fontSize: "1.5rem" }}>🔔</span>
                    </div>
                    <p
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        No notifications yet
                    </p>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        We'll notify you when something happens
                    </p>
                </div>
            )}

            {/* ── Notification list ─────────────────────────────── */}
            {!loading && notifications.length > 0 && (
                <div className="flex flex-col gap-2">
                    {notifications.map((n) => {
                        const data = n.data;
                        const isUnread = !n.read_at;
                        const profileLink = `/${data.actor_username ?? "users/" + data.actor_id}`;

                        return (
                            <div
                                key={n.id}
                                onClick={() => isUnread && handleMarkRead(n.id)}
                                className="card flex items-start gap-3 p-4 cursor-pointer transition-all"
                                style={{
                                    borderLeft: isUnread
                                        ? "3px solid var(--accent)"
                                        : "3px solid transparent",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.boxShadow =
                                        "var(--card-shadow-hover)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.boxShadow =
                                        "var(--card-shadow)")
                                }
                            >
                                {/* Avatar + unread dot */}
                                <div className="relative flex-shrink-0 mt-0.5">
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
                                        <span
                                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                                            style={{
                                                background: "var(--accent)",
                                                border: "2px solid var(--card-bg)",
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Text content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm leading-snug"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        <Link
                                            to={profileLink}
                                            className="font-semibold transition-colors"
                                            style={{
                                                color: "var(--text-primary)",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.color =
                                                    "var(--accent)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.color =
                                                    "var(--text-primary)")
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {data.actor_name}
                                        </Link>{" "}
                                        <span
                                            style={{
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {data.type === "post_liked" &&
                                                "liked your post"}
                                            {data.type === "post_commented" && (
                                                <>
                                                    commented:{" "}
                                                    <span
                                                        style={{
                                                            color: "var(--text-muted)",
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        "
                                                        {data.comment?.slice(
                                                            0,
                                                            50,
                                                        )}
                                                        {data.comment?.length >
                                                        50
                                                            ? "…"
                                                            : ""}
                                                        "
                                                    </span>
                                                </>
                                            )}
                                            {data.type === "user_followed" &&
                                                "started following you"}
                                        </span>
                                    </p>
                                    <p
                                        className="text-xs mt-1"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {getDateDifferenceFromNow(n.created_at)}{" "}
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

            {/* ── Infinite scroll sentinel ──────────────────────── */}
            <div ref={sentinelRef} className="h-4" />

            {loadingMore && (
                <div
                    className="flex items-center justify-center gap-2 py-4 text-sm"
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
                    Loading…
                </div>
            )}

            {!hasMore && notifications.length > 0 && (
                <p
                    className="text-center text-sm py-4"
                    style={{ color: "var(--text-muted)" }}
                >
                    You're all caught up ✓
                </p>
            )}
        </AppLayout>
    );
};

export default NotificationsPage;
