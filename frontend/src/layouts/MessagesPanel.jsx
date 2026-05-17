import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import echo from "../../../resources/js/echo.js";
import Avatar from "../components/common/Avatar";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { getDateDifferenceFromNow } from "../utils";

const MessagesPanel = ({ open, onClose }) => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const authUser = auth?.user;

    const [view, setView] = useState("conversations"); // "conversations" | "chat"
    const [conversations, setConversations] = useState([]);
    const [activeUser, setActiveUser] = useState(null); // user we're chatting with
    const [messages, setMessages] = useState([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const bottomRef = useRef(null);
    const channelRef = useRef(null);

    /* ── Fetch conversations when panel opens ─────────────── */
    useEffect(() => {
        if (!open) return;
        fetchConversations();
    }, [open]);

    /* ── Prevent body scroll when panel is open ──────────────── */
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    /* ── Scroll to bottom when messages change ────────────── */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* ── Subscribe to Echo channel when activeUser changes ── */
    useEffect(() => {
        if (!activeUser || !authUser) return;

        // unsubscribe from previous channel
        if (channelRef.current) {
            echo.leave(channelRef.current);
        }

        const ids = [authUser.id, activeUser.id].sort((a, b) => a - b);
        const channelName = `chat.${ids[0]}.${ids[1]}`;
        channelRef.current = channelName;

        console.log("Subscribing to channel:", channelName);

        const channel = echo.private(channelName);

        channel.listen("MessageSent", (e) => {
            console.log("Message received:", e);
            setMessages((prev) => {
                // avoid duplicates
                if (prev.find((m) => m.id === e.id)) return prev;
                return [...prev, e];
            });
        });

        channel.error((e) => {
            console.error("Channel error:", e);
        });

        return () => {
            echo.leave(channelName);
            channelRef.current = null;
        };
    }, [activeUser, authUser]);

    /* ── Cleanup on panel close ───────────────────────────── */
    useEffect(() => {
        if (!open) {
            if (channelRef.current) {
                echo.leave(channelRef.current);
                channelRef.current = null;
            }
            setView("conversations");
            setActiveUser(null);
            setMessages([]);
            setBody("");
        }
    }, [open]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/conversations`,
            );
            setConversations(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const openChat = async (user) => {
        setActiveUser(user);
        setView("chat");
        setLoading(true);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/messages/${user.id}`,
            );
            setMessages(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!body.trim() || sending) return;
        setSending(true);
        const optimistic = {
            id: `temp-${Date.now()}`,
            body: body.trim(),
            sender_id: authUser.id,
            receiver_id: activeUser.id,
            created_at: new Date().toISOString(),
            sender: authUser,
        };
        setMessages((prev) => [...prev, optimistic]);
        setBody("");
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/messages`,
                { receiver_id: activeUser.id, body: optimistic.body },
            );
            // replace optimistic with real message
            setMessages((prev) =>
                prev.map((m) => (m.id === optimistic.id ? res.data : m)),
            );
            // refresh conversations list
            fetchConversations();
        } catch (e) {
            // remove optimistic on error
            setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
            console.error(e);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (q.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/search?q=${q}`,
            );
            setSearchResults(res.data);
        } catch {
        } finally {
            setSearching(false);
        }
    };

    /* ── Helper: get the other user from a conversation ────── */
    const getOtherUser = (msg) => {
        if (!authUser) return null;
        return msg.sender_id === authUser.id ? msg.receiver : msg.sender;
    };

    const fmtTime = (d) =>
        new Date(d).toLocaleTimeString("en", {
            hour: "2-digit",
            minute: "2-digit",
        });

    /* ════════════════════════════════════════════════════════
       RENDER
       ════════════════════════════════════════════════════════ */
    return (
        <div className={`slide-panel ${open ? "open" : ""}`}>
            {/* ── Header ──────────────────────────────────────── */}
            <div className="slide-panel-header">
                {view === "chat" ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <button
                            onClick={() => {
                                setView("conversations");
                                setActiveUser(null);
                                setMessages([]);
                            }}
                            className="btn btn-ghost btn-icon btn-icon-sm"
                        >
                            ←
                        </button>
                        <Avatar user={activeUser} size="sm" />
                        <div style={{ minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                {activeUser?.firstName} {activeUser?.lastName}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.72rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                @{activeUser?.username}
                            </p>
                        </div>
                    </div>
                ) : (
                    <h2 className="slide-panel-title">💬 Messages</h2>
                )}
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-icon btn-icon-sm"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            {/* ════════════════════════════════════════════════
                CONVERSATIONS VIEW
                ════════════════════════════════════════════════ */}
            {view === "conversations" && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    {/* Search for new conversation */}
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            borderBottom: "1px solid var(--border)",
                        }}
                    >
                        <input
                            type="text"
                            className="input"
                            placeholder="Search people to message…"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        {searchResults.length > 0 && (
                            <div
                                style={{
                                    marginTop: "0.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 12,
                                    overflow: "hidden",
                                }}
                            >
                                {searchResults.map((u) => (
                                    <button
                                        key={u.id}
                                        className="action-menu-item"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setSearchResults([]);
                                            openChat(u);
                                        }}
                                    >
                                        <Avatar user={u} size="sm" />
                                        <div className="text-left">
                                            <p
                                                style={{
                                                    fontSize: "0.875rem",
                                                    fontWeight: 500,
                                                    color: "var(--text-primary)",
                                                }}
                                            >
                                                {u.firstName} {u.lastName}
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                @{u.username}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Conversation list */}
                    <div style={{ overflowY: "auto", flex: 1 }}>
                        {loading && (
                            <p
                                className="text-sm p-4"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Loading…
                            </p>
                        )}

                        {!loading && conversations.length === 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.75rem",
                                    padding: "3rem 2rem",
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                }}
                            >
                                <span style={{ fontSize: "2.5rem" }}>💬</span>
                                <p
                                    style={{
                                        fontWeight: 600,
                                        color: "var(--text-secondary)",
                                    }}
                                >
                                    No messages yet
                                </p>
                                <p style={{ fontSize: "0.85rem" }}>
                                    Search for someone above to start a
                                    conversation.
                                </p>
                            </div>
                        )}

                        {!loading &&
                            conversations.map((msg) => {
                                const other = getOtherUser(msg);
                                if (!other) return null;
                                const isUnread =
                                    msg.receiver_id === authUser?.id &&
                                    !msg.read_at;

                                return (
                                    <button
                                        key={msg.id}
                                        onClick={() => openChat(other)}
                                        style={{
                                            display: "flex",
                                            gap: "0.75rem",
                                            padding: "0.9rem 1.25rem",
                                            borderBottom:
                                                "1px solid var(--border)",
                                            width: "100%",
                                            textAlign: "left",
                                            background: "transparent",
                                            border: "none",
                                            borderBottom:
                                                "1px solid var(--border)",
                                            cursor: "pointer",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                "var(--hover-bg)")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background =
                                                "transparent")
                                        }
                                    >
                                        <div
                                            style={{
                                                position: "relative",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Avatar user={other} size="md" />
                                            {isUnread && (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        top: 0,
                                                        right: 0,
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        background:
                                                            "var(--accent)",
                                                        border: "2px solid var(--bg-surface)",
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    marginBottom: 2,
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: isUnread
                                                            ? 700
                                                            : 500,
                                                        color: "var(--text-primary)",
                                                    }}
                                                >
                                                    {other.firstName}{" "}
                                                    {other.lastName}
                                                </p>
                                                <span
                                                    style={{
                                                        fontSize: "0.72rem",
                                                        color: "var(--text-muted)",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {getDateDifferenceFromNow(
                                                        msg.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            <p
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: isUnread
                                                        ? "var(--text-primary)"
                                                        : "var(--text-muted)",
                                                    fontWeight: isUnread
                                                        ? 600
                                                        : 400,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {msg.sender_id === authUser?.id
                                                    ? "You: "
                                                    : ""}
                                                {msg.body}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════
                CHAT VIEW
                ════════════════════════════════════════════════ */}
            {view === "chat" && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            overflowX: "hidden",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        }}
                    >
                        {loading && (
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--text-muted)",
                                    textAlign: "center",
                                }}
                            >
                                Loading…
                            </p>
                        )}

                        {!loading && messages.length === 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    marginTop: "auto",
                                    padding: "2rem",
                                    textAlign: "center",
                                }}
                            >
                                <Avatar user={activeUser} size="md" />
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {activeUser?.firstName}{" "}
                                    {activeUser?.lastName}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Start the conversation!
                                </p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMine = msg.sender_id === authUser?.id;
                            return (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: isMine
                                            ? "flex-end"
                                            : "flex-start",
                                        gap: "0.5rem",
                                        alignItems: "flex-end",
                                    }}
                                >
                                    {!isMine && (
                                        <Avatar user={activeUser} size="sm" />
                                    )}
                                    <div style={{ maxWidth: "70%" }}>
                                        <div
                                            style={{
                                                padding: "0.55rem 0.85rem",
                                                borderRadius: isMine
                                                    ? "18px 18px 4px 18px"
                                                    : "18px 18px 18px 4px",
                                                background: isMine
                                                    ? "var(--accent)"
                                                    : "var(--bg-surface-2)",
                                                color: isMine
                                                    ? "#fff"
                                                    : "var(--text-primary)",
                                                fontSize: "0.875rem",
                                                lineHeight: 1.45,
                                                wordBreak: "break-word",
                                                opacity: msg.id
                                                    ?.toString()
                                                    .startsWith("temp-")
                                                    ? 0.6
                                                    : 1,
                                            }}
                                        >
                                            {msg.body}
                                        </div>
                                        <p
                                            style={{
                                                fontSize: "0.65rem",
                                                color: "var(--text-muted)",
                                                marginTop: 3,
                                                textAlign: isMine
                                                    ? "right"
                                                    : "left",
                                            }}
                                        >
                                            {fmtTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            borderTop: "1px solid var(--border)",
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "flex-end",
                        }}
                    >
                        <textarea
                            className="input"
                            rows={1}
                            style={{
                                flex: 1,
                                resize: "none",
                                maxHeight: 100,
                                overflowY: "auto",
                                lineHeight: 1.5,
                                padding: "0.55rem 0.85rem",
                            }}
                            placeholder="Type a message…"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height =
                                    Math.min(e.target.scrollHeight, 100) + "px";
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!body.trim() || sending}
                            className="btn btn-primary btn-icon"
                            style={{
                                flexShrink: 0,
                                borderRadius: "50%",
                                width: 38,
                                height: 38,
                            }}
                        >
                            <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPanel;

/* ══════════════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
   ══════════════════════════════════════════════════════════════ */
export const NotificationsPanel = ({ open, onClose }) => {
    const { api } = useAxios();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
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
            return `/posts/${data.post_id}`;
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
                                        onClose();
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
                                        {getDateDifferenceFromNow(n.created_at)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};
