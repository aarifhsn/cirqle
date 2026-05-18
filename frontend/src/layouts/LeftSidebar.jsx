import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logout from "../components/auth/Logout";
import Avatar from "../components/common/Avatar";
import { useCircles } from "../context/CirclesContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const NAV_ITEMS = [
    { icon: "⌂", label: "Home", href: "/" },
    { icon: "🔍", label: "Search", panel: "search" },
    { icon: "◷", label: "Events", href: "/events" },
    { icon: "⌖", label: "Nearby", href: "/nearby" },
    { icon: "◎", label: "Circles", href: "/circles" },
    { icon: "◫", label: "Marketplace", href: "/marketplace" },
    { icon: "✉", label: "Messages", panel: "messages" },
    { icon: "◉", label: "Notifications", panel: "notifications" },
    { icon: "⌑", label: "Saved", href: "/saved" },
];

const LeftSidebar = ({
    onOpenPanel,
    activePanel,
    unreadCount = 0,
    unreadMessagesCount = 0,
}) => {
    const { api } = useAxios();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { auth } = useAuth();
    const user = auth?.user;
    const displayName =
        user?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const settingsRef = useRef(null);
    const searchRef = useRef(null);
    const { circles } = useCircles();
    const myCircles = circles.filter((c) => c.is_member).slice(0, 5);

    // Close settings on outside click
    useEffect(() => {
        const handler = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target))
                setShowSettings(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
                setSearchQuery("");
                setSearchResults([]);
            }
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowSearch(false);
                setSearchQuery("");
                setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handler);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/search?q=${query}`,
            );
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearchSelect = (username) => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        navigate(`/${username}`);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "1.25rem 0.75rem",
                gap: "0.15rem",
            }}
        >
            {/* ── Logo ──────────────────────────────────────────── */}
            <Link
                to="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.25rem 0.5rem 1.25rem",
                    textDecoration: "none",
                    flexShrink: 0,
                }}
            >
                <div
                    className="sidebar-icon-only"
                    style={{
                        fontSize: "1.5rem",
                        fontFamily: "var(--font-logo)",
                    }}
                >
                    Cirqle
                </div>
            </Link>

            {/* ── Main navigation ───────────────────────────────── */}
            <nav
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href
                        ? location.pathname === item.href
                        : activePanel === item.panel;

                    if (item.href) {
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                            >
                                <span
                                    style={{
                                        fontSize: "1.1rem",
                                        flexShrink: 0,
                                        width: 20,
                                        textAlign: "center",
                                    }}
                                >
                                    {item.icon}
                                </span>
                                <span
                                    className="sidebar-label"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                        flex: 1,
                                    }}
                                >
                                    {item.label}
                                    {item.panel === "notifications" &&
                                        unreadCount > 0 && (
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    lineHeight: 1,
                                                    padding: "5px 7px",
                                                    borderRadius: 999,
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    marginLeft: "auto",
                                                }}
                                            >
                                                {unreadCount > 9
                                                    ? "9+"
                                                    : unreadCount}
                                            </span>
                                        )}
                                    {item.panel === "messages" &&
                                        unreadMessagesCount > 0 && (
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    lineHeight: 1,
                                                    padding: "5px 7px",
                                                    borderRadius: 999,
                                                    background: "var(--accent)",
                                                    color: "#fff",
                                                    marginLeft: "auto",
                                                }}
                                            >
                                                {unreadMessagesCount > 9
                                                    ? "9+"
                                                    : unreadMessagesCount}
                                            </span>
                                        )}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                if (item.panel === "search") {
                                    setShowSearch((p) => !p);
                                } else {
                                    onOpenPanel(item.panel);
                                }
                            }}
                            className={`nav-item ${isActive ? "active" : ""}`}
                            style={{ width: "100%", textAlign: "left" }}
                        >
                            <span
                                style={{
                                    fontSize: "1.1rem",
                                    flexShrink: 0,
                                    width: 20,
                                    textAlign: "center",
                                }}
                            >
                                {item.icon}
                            </span>
                            {/* ↓ replace the plain span with this */}
                            <span
                                className="sidebar-label"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                    flex: 1,
                                }}
                            >
                                {item.label}
                                {item.panel === "notifications" &&
                                    unreadCount > 0 && (
                                        <span
                                            style={{
                                                fontSize: "0.65rem",
                                                fontWeight: 700,
                                                lineHeight: 1,
                                                padding: "5px 7px",
                                                borderRadius: 999,
                                                background: "var(--accent)",
                                                color: "#fff",
                                                marginLeft: "auto",
                                            }}
                                        >
                                            {unreadCount > 9
                                                ? "9+"
                                                : unreadCount}
                                        </span>
                                    )}
                                {item.panel === "messages" &&
                                    unreadMessagesCount > 0 && (
                                        <span
                                            style={{
                                                fontSize: "0.65rem",
                                                fontWeight: 700,
                                                lineHeight: 1,
                                                padding: "5px 7px",
                                                borderRadius: 999,
                                                background: "var(--accent)",
                                                color: "#fff",
                                                marginLeft: "auto",
                                            }}
                                        >
                                            {unreadMessagesCount > 9
                                                ? "9+"
                                                : unreadMessagesCount}
                                        </span>
                                    )}
                            </span>
                        </button>
                    );
                })}
            </nav>
            {/* ── Search overlay ────────────────────────────────── */}
            {showSearch &&
                createPortal(
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 200,
                            background: "var(--bg-overlay)",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            paddingTop: "8rem",
                            backdropFilter: "blur(3px)",
                        }}
                        onClick={(e) => {
                            // close when clicking backdrop
                            if (e.target === e.currentTarget) {
                                setShowSearch(false);
                                setSearchQuery("");
                                setSearchResults([]);
                            }
                        }}
                    >
                        <div
                            ref={searchRef}
                            style={{
                                width: "100%",
                                maxWidth: 520,
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: 16,
                                boxShadow: "var(--shadow-lg)",
                                padding: "0.75rem",
                                margin: "0 1rem",
                            }}
                        >
                            <input
                                autoFocus
                                type="text"
                                className="input"
                                placeholder="Search people…"
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
                                    }}
                                >
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() =>
                                                handleSearchSelect(
                                                    result.username,
                                                )
                                            }
                                            className="action-menu-item"
                                        >
                                            <Avatar user={result} size="sm" />
                                            <div className="text-left">
                                                <p
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 500,
                                                        color: "var(--text-primary)",
                                                    }}
                                                >
                                                    {result.firstName}{" "}
                                                    {result.lastName}
                                                </p>
                                                <p
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    @{result.username}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {searchQuery.length >= 2 &&
                                searchResults.length === 0 && (
                                    <p
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "var(--text-muted)",
                                            padding: "0.5rem 0",
                                        }}
                                    >
                                        No users found for "{searchQuery}"
                                    </p>
                                )}
                        </div>
                    </div>,
                    document.body,
                )}

            {/* ── My Circles ────────────────────────────────────── */}
            <div className="sidebar-label" style={{ marginTop: "1.25rem" }}>
                <p className="section-label" style={{ paddingLeft: "0.5rem" }}>
                    My Circles
                </p>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                    }}
                >
                    {myCircles.length > 0 &&
                        myCircles.map((c) => (
                            <Link
                                key={c.name}
                                to={`/circles/${c.id}`}
                                className="circle-chip"
                                style={{ textDecoration: "none" }}
                            >
                                <span className="circle-icon">{c.emoji}</span>
                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                            color: "var(--text-primary)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {c.name}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.72rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {c.members} members
                                    </p>
                                </div>
                            </Link>
                        ))}
                    {myCircles.length === 0 && (
                        <div style={{ padding: "0.5rem 0.5rem 0.25rem" }}>
                            <p
                                style={{
                                    fontSize: "0.78rem",
                                    color: "var(--text-muted)",
                                    lineHeight: 1.5,
                                }}
                            >
                                You haven't joined any circles yet.
                            </p>
                            <Link
                                to="/circles"
                                style={{
                                    fontSize: "0.78rem",
                                    color: "var(--accent)",
                                    fontWeight: 600,
                                }}
                            >
                                Browse circles →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div
                style={{
                    position: "sticky",
                    bottom: 0,
                    background: "var(--sidebar-bg)",
                    padding: "0.5rem 0",
                    marginTop: "auto",
                    boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.05)",
                }}
            >
                {/* ── Theme toggle ──────────────────────────────────── */}
                <button
                    onClick={toggleTheme}
                    className="nav-item text-sm"
                    style={{ width: "100%", textAlign: "left" }}
                >
                    <span
                        style={{
                            flexShrink: 0,
                            width: 20,
                            textAlign: "center",
                            fontSize: "1rem",
                        }}
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </span>
                    <span className="sidebar-label text-sm">
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                </button>

                {user && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            marginTop: "0.25rem",
                        }}
                    >
                        {/* Profile link */}
                        <Link
                            to={`/${user.username}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                                padding: "0.6rem 0.5rem",
                                borderRadius: 12,
                                textDecoration: "none",
                                flex: 1,
                                transition: "background var(--transition-fast)",
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
                                style={{ position: "relative", flexShrink: 0 }}
                            >
                                <Avatar user={user} size="sm" />
                                <span className="online-dot" />
                            </div>
                            <div
                                className="sidebar-label"
                                style={{ minWidth: 0 }}
                            >
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {displayName}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.73rem",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    @{user.username}
                                </p>
                            </div>
                        </Link>

                        {/* Settings cog + popover */}
                        <div
                            ref={settingsRef}
                            style={{ position: "relative", flexShrink: 0 }}
                            className="sidebar-label"
                        >
                            <button
                                onClick={() => setShowSettings((p) => !p)}
                                className="btn btn-ghost btn-icon"
                                title="Settings"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {/* Cog icon */}
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
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </button>

                            {showSettings && (
                                <div
                                    className="card animate-fade-in"
                                    style={{
                                        position: "absolute",
                                        bottom: "calc(100% + 8px)",
                                        right: 0,
                                        minWidth: 180,
                                        padding: "0.35rem",
                                        zIndex: 100,
                                        boxShadow: "var(--shadow-lg)",
                                    }}
                                >
                                    <Link
                                        to={`/${user.username}`}
                                        onClick={() => setShowSettings(false)}
                                        className="action-menu-item"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        My Profile
                                    </Link>
                                    <div
                                        style={{
                                            height: 1,
                                            background: "var(--border)",
                                            margin: "4px 0",
                                        }}
                                    />
                                    <Logout isMenuItem />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
