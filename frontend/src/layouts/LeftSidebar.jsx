import { Link, useLocation } from "react-router-dom";
import LogoDark from "../assets/cirqle-logo-dark.png";
import LogoLight from "../assets/cirqle-logo-light.png";
import Avatar from "../components/common/Avatar";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
    { icon: "⌂", label: "Home", href: "/" },
    { icon: "◷", label: "Events", href: "/events" },
    { icon: "⌖", label: "Nearby", href: "/nearby" },
    { icon: "◎", label: "Circles", href: "/circles" },
    { icon: "◫", label: "Marketplace", href: "/marketplace" },
    { icon: "✉", label: "Messages", panel: "messages" },
    { icon: "◉", label: "Notifications", panel: "notifications" },
    { icon: "⌑", label: "Saved", href: "/saved" },
];

const CIRCLES = [
    {
        emoji: "⌂",
        name: "Dhaka Circle",
        href: "/circles/dhaka",
        members: "12.4k",
    },
    {
        emoji: "◧",
        name: "Job Seekers",
        href: "/circles/jobs",
        members: "8.2k",
    },
    {
        emoji: "⌘",
        name: "Students",
        href: "/circles/students",
        members: "5.6k",
    },
    {
        emoji: "◌",
        name: "Food Lovers",
        href: "/circles/food",
        members: "3.1k",
    },
    {
        emoji: "▲",
        name: "Fitness",
        href: "/circles/fitness",
        members: "2.4k",
    },
];

const LeftSidebar = ({ onOpenPanel, activePanel }) => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { auth } = useAuth();
    const user = auth?.user;
    const displayName =
        user?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

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
                {/* Full wordmark — hidden when sidebar is icon-only */}
                <img
                    src={theme === "dark" ? LogoLight : LogoDark}
                    alt="Cirqle"
                    className="sidebar-label"
                    style={{
                        height: 30,
                        width: "auto",
                        objectFit: "contain",
                        display: "block",
                    }}
                />
                {/* Icon fallback — only visible when collapsed (CSS hides/shows) */}
                <div
                    className="sidebar-icon-only"
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "1rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                        flexShrink: 0,
                    }}
                >
                    C
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
                                <span className="sidebar-label">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={item.label}
                            onClick={() => onOpenPanel(item.panel)}
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
                            <span className="sidebar-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

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
                    {CIRCLES.map((c) => (
                        <Link
                            key={c.name}
                            to={c.href}
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
                </div>
            </div>

            {/* ── Spacer ────────────────────────────────────────── */}
            <div style={{ flex: 1 }} />

            {/* ── Theme toggle ──────────────────────────────────── */}
            <button
                onClick={toggleTheme}
                className="nav-item"
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
                        <Avatar user={user} size="sm" />
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
            )}
        </div>
    );
};

export default LeftSidebar;
