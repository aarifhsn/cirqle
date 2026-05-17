import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../hooks/useAxios";
import { getDateDifferenceFromNow } from "../utils";

const MessagesPanel = ({ open, onClose }) => {
    return (
        <div className={`slide-panel ${open ? "open" : ""}`}>
            <div className="slide-panel-header">
                <h2 className="slide-panel-title">💬 Messages</h2>
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    padding: "2rem",
                    color: "var(--text-muted)",
                }}
            >
                <span style={{ fontSize: "2.5rem" }}>💬</span>
                <p style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    Messages coming soon
                </p>
                <p style={{ fontSize: "0.85rem", textAlign: "center" }}>
                    Real-time messaging with people in your circles.
                </p>
            </div>
        </div>
    );
};

export default MessagesPanel;

export const NotificationsPanel = ({ open, onClose }) => {
    const { api } = useAxios();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return; // only fetch when panel opens
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/notifications?page=1`,
                );
                setNotifications(res.data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [open]);

    const getNotificationLink = (data) => {
        if (data.type === "post_liked" || data.type === "post_commented") {
            return `/posts/${data.post_id}`; // adjust to your post route
        }
        if (data.type === "user_followed") {
            return `/${data.actor_username}`;
        }
        return null;
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
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={`slide-panel ${open ? "open" : ""}`}>
            <div className="slide-panel-header">
                <h2 className="slide-panel-title">🔔 Notifications</h2>
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
                {loading && (
                    <p
                        className="text-sm p-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Loading…
                    </p>
                )}

                {!loading && notifications.length === 0 && (
                    <p
                        className="text-sm p-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        No notifications yet
                    </p>
                )}

                {!loading &&
                    notifications.map((n, i) => {
                        const data = n.data;
                        const isUnread = !n.read_at;

                        const iconMap = {
                            post_liked: "❤️",
                            post_commented: "💬",
                            user_followed: "👥",
                        };

                        return (
                            <div
                                key={n.id}
                                style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    padding: "0.9rem 1.25rem",
                                    borderBottom: "1px solid var(--border)",
                                    borderLeft: isUnread
                                        ? "3px solid var(--accent)"
                                        : "3px solid transparent",
                                    cursor: "pointer",
                                    animationDelay: `${i * 50}ms`,
                                }}
                                onClick={async () => {
                                    if (isUnread) await handleMarkRead(n.id);
                                    const link = getNotificationLink(data);
                                    if (link) {
                                        onClose(); // close the panel
                                        navigate(link);
                                    }
                                }}
                                className="animate-fade-in"
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "var(--hover-bg)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        "transparent")
                                }
                            >
                                <span
                                    style={{
                                        fontSize: "1.25rem",
                                        width: 36,
                                        height: 36,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--accent-soft)",
                                        borderRadius: 10,
                                        flexShrink: 0,
                                    }}
                                >
                                    {iconMap[data.type] ?? "🔔"}
                                </span>
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "var(--text-primary)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {data.actor_name}{" "}
                                        <span
                                            style={{
                                                fontWeight: 400,
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            {data.type === "post_liked" &&
                                                "liked your post"}
                                            {data.type === "post_commented" &&
                                                `commented: "${data.comment?.slice(0, 40)}…"`}
                                            {data.type === "user_followed" &&
                                                "started following you"}
                                        </span>
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "var(--text-muted)",
                                            marginTop: 2,
                                        }}
                                    >
                                        {getDateDifferenceFromNow(n.created_at)}{" "}
                                        ago
                                    </p>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};
