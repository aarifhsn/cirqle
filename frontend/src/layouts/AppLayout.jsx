import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoDark from "../assets/cirqle-logo-dark.png";
import LogoLight from "../assets/cirqle-logo-light.png";
import Avatar from "../components/common/Avatar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import LeftSidebar from "./LeftSidebar";
import MessagesPanel, { NotificationsPanel } from "./MessagesPanel";
import RightSidebar from "./RightSidebar";

const MobileHeader = () => {
    const { theme } = useTheme();
    const { api } = useAxios();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/search?q=${q}`,
            );
            setResults(res.data);
            setShowResults(true);
        } catch {}
    };

    return (
        <header
            className="show-on-mobile glass"
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 1rem",
                }}
            >
                {/* Logo */}
                <Link to="/" style={{ flexShrink: 0 }}>
                    <img
                        style={{ maxWidth: 70 }}
                        src={theme === "dark" ? LogoLight : LogoDark}
                        alt="Cirqle"
                    />
                </Link>

                {/* Search */}
                <div style={{ flex: 1, position: "relative" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "0.45rem 0.75rem",
                            borderRadius: 999,
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-strong)",
                        }}
                    >
                        <svg
                            style={{
                                color: "var(--text-muted)",
                                flexShrink: 0,
                                width: 14,
                                height: 14,
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearch}
                            onFocus={() =>
                                query.length >= 2 && setShowResults(true)
                            }
                            onBlur={() =>
                                setTimeout(() => setShowResults(false), 150)
                            }
                            placeholder="Search people…"
                            style={{
                                background: "transparent",
                                color: "var(--text-primary)",
                                fontSize: "0.875rem",
                                outline: "none",
                                width: "100%",
                                border: "none",
                            }}
                        />
                        {query && (
                            <button
                                onClick={() => {
                                    setQuery("");
                                    setResults([]);
                                    setShowResults(false);
                                }}
                                style={{
                                    color: "var(--text-muted)",
                                    flexShrink: 0,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Search results */}
                    {showResults && results.length > 0 && (
                        <div
                            className="action-modal-container"
                            style={{
                                position: "absolute",
                                top: "calc(100% + 6px)",
                                left: 0,
                                right: 0,
                                zIndex: 60,
                            }}
                        >
                            {results.map((r) => (
                                <button
                                    key={r.id}
                                    className="action-menu-item"
                                    onClick={() => {
                                        setQuery("");
                                        setResults([]);
                                        setShowResults(false);
                                        navigate(`/${r.username}`);
                                    }}
                                >
                                    <Avatar user={r} size="sm" />
                                    <div className="text-left">
                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            {r.firstName} {r.lastName}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            @{r.username}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showResults &&
                        query.length >= 2 &&
                        results.length === 0 && (
                            <div
                                className="action-modal-container"
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 6px)",
                                    left: 0,
                                    right: 0,
                                    zIndex: 60,
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.875rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                No users found for "{query}"
                            </div>
                        )}
                </div>
            </div>
        </header>
    );
};

const MobileBottomNav = ({
    onOpenPanel,
    activePanel,
    unreadCount = 0,
    unreadMessagesCount = 0,
}) => {
    const location = useLocation();
    const { auth } = useAuth();
    const user = auth?.user;

    const navItems = [
        { icon: "⌂", label: "Home", href: "/" },
        { icon: "◎", label: "Circles", href: "/circles" },
        { icon: "◷", label: "Events", href: "/events" },
        { icon: "◉", label: "Notifs", panel: "notifications" },
        { icon: "⌑", label: "Saved", href: "/saved" },
    ];

    const baseStyle = (isActive) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0.25rem 0.5rem",
        borderRadius: 10,
        textDecoration: "none",
        color: isActive ? "var(--accent)" : "var(--text-muted)",
        transition: "color var(--transition-fast)",
        minWidth: 0,
        flex: 1,
    });

    return (
        <nav
            className="show-on-mobile"
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                height: 64,
                background: "var(--sidebar-bg)",
                borderTop: "1px solid var(--border)",
                alignItems: "center",
                justifyContent: "space-around",
                zIndex: 110,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            {navItems.map((item) => {
                const isActive = item.href
                    ? location.pathname === item.href
                    : activePanel === item.panel;

                const content = (
                    <>
                        <span
                            style={{
                                fontSize: "1.2rem",
                                position: "relative",
                                lineHeight: 1,
                            }}
                        >
                            {item.icon}
                            {item.panel === "notifications" &&
                                unreadCount > 0 && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: -4,
                                            right: -6,
                                            fontSize: "0.55rem",
                                            fontWeight: 700,
                                            padding: "1px 4px",
                                            borderRadius: 999,
                                            background: "var(--accent)",
                                            color: "#fff",
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            {item.panel === "messages" &&
                                unreadMessagesCount > 0 && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: -4,
                                            right: -6,
                                            fontSize: "0.55rem",
                                            fontWeight: 700,
                                            padding: "1px 4px",
                                            borderRadius: 999,
                                            background: "var(--accent)",
                                            color: "#fff",
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {unreadMessagesCount > 9
                                            ? "9+"
                                            : unreadMessagesCount}
                                    </span>
                                )}
                        </span>
                        <span
                            style={{
                                fontSize: "0.6rem",
                                fontWeight: isActive ? 600 : 400,
                            }}
                        >
                            {item.label}
                        </span>
                    </>
                );

                if (item.href) {
                    return (
                        <Link
                            key={item.label}
                            to={item.href}
                            style={baseStyle(isActive)}
                        >
                            {content}
                        </Link>
                    );
                }

                return (
                    <button
                        key={item.label}
                        style={baseStyle(isActive)}
                        onClick={() => onOpenPanel(item.panel)}
                    >
                        {content}
                    </button>
                );
            })}

            {/* Profile */}
            <Link
                to={`/${user?.username}`}
                style={{
                    ...baseStyle(location.pathname === `/${user?.username}`),
                }}
            >
                <Avatar user={user} size="sm" />
                <span style={{ fontSize: "0.6rem", marginTop: 1 }}>
                    Profile
                </span>
            </Link>
        </nav>
    );
};

const AppLayout = ({ children, hideRightSidebar = false }) => {
    const { api } = useAxios();
    const [activePanel, setActivePanel] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchCounts = async () => {
            try {
                const res = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/unread-counts`,
                );
                if (!cancelled) {
                    setUnreadCount(res.data.notifications);
                    setUnreadMessages(res.data.messages);
                }
            } catch {}
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []); // ← empty deps, no api dependency

    const openPanel = (panel) => {
        setActivePanel(panel);
        if (panel === "notifications") setUnreadCount(0);
        if (panel === "messages") setUnreadMessages(0);
    };
    const closePanel = () => setActivePanel(null);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                background: "var(--bg-base)",
            }}
        >
            {/* ── Mobile top header (hidden on desktop) ─────────── */}
            <MobileHeader />

            {/* ── Main row ──────────────────────────────────────── */}
            <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
                {/* ── Left Sidebar (hidden on mobile) ───────────── */}
                <aside
                    style={{
                        width: "var(--sidebar-left-w)",
                        flexShrink: 0,
                        position: "sticky",
                        top: 0,
                        height: "100vh",
                        overflowY: "auto",
                        overflowX: "hidden",
                        background: "var(--sidebar-bg)",
                        borderRight: "1px solid var(--sidebar-border)",
                        zIndex: 100,
                        transition: "width var(--transition-base)",
                    }}
                    className="hide-on-mobile"
                >
                    <LeftSidebar
                        onOpenPanel={openPanel}
                        activePanel={activePanel}
                        unreadCount={unreadCount}
                        unreadMessagesCount={unreadMessages}
                    />
                </aside>

                {/* ── Main Content ──────────────────────────────── */}
                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "1.5rem 1.25rem",
                        // extra bottom padding on mobile for bottom nav
                        paddingBottom: "5rem",
                        gap: "0",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "var(--feed-max-w)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.85rem",
                        }}
                    >
                        {children}
                    </div>
                </main>

                {/* ── Right Sidebar (hidden on small screens) ───── */}
                {!hideRightSidebar && (
                    <aside
                        style={{
                            width: "var(--sidebar-right-w)",
                            flexShrink: 0,
                            position: "sticky",
                            top: 0,
                            height: "100vh",
                            overflowY: "auto",
                            overflowX: "hidden",
                            padding: "1.5rem 1rem 1.5rem 0",
                            transition: "width var(--transition-base)",
                        }}
                        className="hide-on-small"
                    >
                        <RightSidebar />
                    </aside>
                )}
            </div>

            {/* ── Slide Panels ──────────────────────────────────── */}
            <div
                className={`overlay ${activePanel ? "visible" : ""}`}
                onClick={closePanel}
            />
            <MessagesPanel
                open={activePanel === "messages"}
                onClose={closePanel}
                unreadCount={unreadCount}
                unreadMessages={unreadMessages}
                onNewMessage={() => {
                    // Increment unread count when new message arrives
                    setUnreadMessages((prev) => prev + 1);
                }}
            />
            <NotificationsPanel
                open={activePanel === "notifications"}
                onClose={closePanel}
            />

            {/* ── Mobile Bottom Nav (hidden on desktop) ─────────── */}
            <MobileBottomNav
                onOpenPanel={openPanel}
                activePanel={activePanel}
                unreadCount={unreadCount}
                unreadMessagesCount={unreadMessages}
            />
        </div>
    );
};

export default AppLayout;
