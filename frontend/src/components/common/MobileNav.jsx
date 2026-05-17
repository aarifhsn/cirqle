import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "./Avatar";

const MOBILE_NAV = [
    { icon: "⌂", label: "Home", href: "/" },
    { icon: "◎", label: "Circles", href: "/circles" },
    { icon: "◷", label: "Events", href: "/events" },
    { icon: "◉", label: "Notifs", panel: "notifications" },
    { icon: "⌑", label: "Saved", href: "/saved" },
];

const MobileNav = ({ onOpenPanel, activePanel, unreadCount }) => {
    const location = useLocation();
    const { auth } = useAuth();
    const user = auth?.user;

    return (
        <nav
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: "var(--sidebar-bg)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                padding: "0.4rem 0.5rem",
                gap: "0.25rem",
            }}
            className="lg:hidden"
        >
            {MOBILE_NAV.map((item) => {
                const isActive = item.href
                    ? location.pathname === item.href
                    : activePanel === item.panel;

                const inner = (
                    <>
                        <span
                            style={{ fontSize: "1.2rem", position: "relative" }}
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
                        </span>
                        <span style={{ fontSize: "0.65rem", marginTop: 2 }}>
                            {item.label}
                        </span>
                    </>
                );

                const style = {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0.4rem 0.25rem",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    background: isActive ? "var(--accent-soft)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 0.15s, background 0.15s",
                };

                if (item.href) {
                    return (
                        <Link key={item.label} to={item.href} style={style}>
                            {inner}
                        </Link>
                    );
                }

                return (
                    <button
                        key={item.label}
                        onClick={() => {
                            onOpenPanel(item.panel);
                        }}
                        style={style}
                    >
                        {inner}
                    </button>
                );
            })}

            {/* Profile avatar as last item */}
            <Link
                to={`/${user?.username}`}
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0.4rem 0.25rem",
                    borderRadius: 10,
                    textDecoration: "none",
                }}
            >
                <Avatar user={user} size="sm" />
                <span
                    style={{
                        fontSize: "0.65rem",
                        marginTop: 2,
                        color: "var(--text-muted)",
                    }}
                >
                    Profile
                </span>
            </Link>
        </nav>
    );
};

export default MobileNav;
