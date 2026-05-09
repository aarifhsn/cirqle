import { Link, useLocation } from "react-router-dom";
import Avatar from "../components/common/Avatar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";

/* ── Nav items config ─────────────────────────────────────────── */
const NAV_ITEMS = [
    { icon: "🏠", label: "Home", href: "/" },
    { icon: "🔍", label: "Explore", href: "/explore" },
    { icon: "📍", label: "Nearby", href: "/nearby" },
    { icon: "⭕", label: "Circles", href: "/circles" },
    { icon: "🛍️", label: "Marketplace", href: "/marketplace" },
    { icon: "💬", label: "Messages", panel: "messages", badge: 3 },
    { icon: "🔔", label: "Notifications", panel: "notifications", badge: 7 },
    { icon: "🔖", label: "Saved", href: "/saved" },
];

const LeftSidebar = ({ onOpenPanel, activePanel }) => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    // Safely get auth — your useAuth hook provides this
    let user = null;
    try {
        const auth = useAuth();
        user = auth?.user;
    } catch (_) {}

    const isCollapsed =
        typeof window !== "undefined" &&
        window.innerWidth <= 1024 &&
        window.innerWidth > 768;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                padding: "1.25rem 0.75rem",
                gap: "0.25rem",
            }}
        >
            {/* ── Logo ──────────────────────────────────────────── */}
            <Link
                to="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    padding: "0.25rem 0.5rem 1.25rem",
                    textDecoration: "none",
                    flexShrink: 0,
                }}
            >
                {/* Logo icon — always shown */}
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        flexShrink: 0,
                        fontFamily: "var(--font-display)",
                    }}
                >
                    C
                </div>
                {/* Wordmark — hidden when collapsed */}
                <span
                    className="sidebar-label"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.35rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Cirqle
                </span>
            </Link>

            {/* ── Main Nav ──────────────────────────────────────── */}
            <nav
                style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href
                        ? location.pathname === item.href
                        : activePanel === item.panel;

                    const handleClick = () => {
                        if (item.panel) onOpenPanel(item.panel);
                    };

                    if (item.href) {
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`nav-item ${isActive ? "active" : ""}`}
                            >
                                <span
                                    style={{ fontSize: "1.15rem" }}
                                    className="nav-icon"
                                >
                                    {item.icon}
                                </span>
                                <span className="sidebar-label">
                                    {item.label}
                                </span>
                                {item.badge && (
                                    <span className="nav-badge sidebar-label">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.label}
                            onClick={handleClick}
                            className={`nav-item ${isActive ? "active" : ""}`}
                            style={{ width: "100%", textAlign: "left" }}
                        >
                            <span
                                style={{ fontSize: "1.15rem" }}
                                className="nav-icon"
                            >
                                {item.icon}
                            </span>
                            <span className="sidebar-label">{item.label}</span>
                            {item.badge && (
                                <span className="nav-badge sidebar-label">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Circles quick-access ──────────────────────────── */}
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
                    {CIRCLES.map((c) => (
                        <Link key={c.name} to={c.href} className="circle-chip">
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
                </div>
            </div>

            {/* ── Spacer ────────────────────────────────────────── */}
            <div style={{ flex: 1 }} />

            {/* ── Theme Toggle ──────────────────────────────────── */}
            <button
                onClick={toggleTheme}
                className="nav-item"
                style={{ width: "100%", textAlign: "left" }}
            >
                <span style={{ fontSize: "1.1rem" }}>
                    {theme === "dark" ? "☀️" : "🌙"}
                </span>
                <span className="sidebar-label">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
            </button>

            {/* ── Profile quick-link ────────────────────────────── */}
            {user && (
                <Link
                    to={`/${user.username}`}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        padding: "0.6rem 0.5rem",
                        borderRadius: 12,
                        textDecoration: "none",
                        marginTop: "0.25rem",
                        transition: "background var(--transition-fast)",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--hover-bg)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                    }
                >
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <Avatar user={user} size={34} />
                        <span className="online-dot" />
                    </div>
                    <div className="sidebar-label" style={{ minWidth: 0 }}>
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
                            {user.name}
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
            )}
        </div>
    );
};

/* ── Sample circles (replace with real API data later) ────────── */
const CIRCLES = [
    {
        emoji: "🏙️",
        name: "Dhaka Circle",
        href: "/circles/dhaka",
        members: "12.4k",
    },
    {
        emoji: "💼",
        name: "Job Seekers",
        href: "/circles/jobs",
        members: "8.2k",
    },
    {
        emoji: "🎓",
        name: "Students Circle",
        href: "/circles/students",
        members: "5.6k",
    },
    {
        emoji: "🍜",
        name: "Food Lovers",
        href: "/circles/food",
        members: "3.1k",
    },
    {
        emoji: "💪",
        name: "Fitness Circle",
        href: "/circles/fitness",
        members: "2.4k",
    },
];

export default LeftSidebar;
