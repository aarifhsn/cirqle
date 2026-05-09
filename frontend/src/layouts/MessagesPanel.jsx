/* MessagesPanel.jsx
 * Cirqle — Slide-in Messages panel
 * Wire to your messages API in a later step
 */

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

/* ─────────────────────────────────────────────────────────────── */

/* NotificationsPanel.jsx
 * Cirqle — Slide-in Notifications panel
 * Wire to your notifications API in a later step
 */

export const NotificationsPanel = ({ open, onClose }) => {
    const SAMPLE = [
        { id: 1, icon: "❤️", text: "Arif liked your post", time: "2m ago" },
        {
            id: 2,
            icon: "💬",
            text: "Nadia commented on your post",
            time: "15m ago",
        },
        {
            id: 3,
            icon: "👥",
            text: "Lamia started following you",
            time: "1h ago",
        },
        { id: 4, icon: "⭕", text: "New post in Dhaka Circle", time: "2h ago" },
    ];

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
                {SAMPLE.map((n, i) => (
                    <div
                        key={n.id}
                        style={{
                            display: "flex",
                            gap: "0.75rem",
                            padding: "0.9rem 1.25rem",
                            borderBottom: "1px solid var(--border)",
                            cursor: "pointer",
                            transition: "background var(--transition-fast)",
                            animationDelay: `${i * 50}ms`,
                        }}
                        className="animate-fade-in"
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                                "var(--hover-bg)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
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
                            {n.icon}
                        </span>
                        <div>
                            <p
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--text-primary)",
                                    fontWeight: 500,
                                }}
                            >
                                {n.text}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                    marginTop: 2,
                                }}
                            >
                                {n.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
