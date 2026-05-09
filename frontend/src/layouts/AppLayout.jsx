import { useState } from "react";
import { useLocation } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import MessagesPanel, { NotificationsPanel } from "./MessagesPanel";
import RightSidebar from "./RightSidebar";

const AppLayout = ({ children, hideRightSidebar = false }) => {
    const [activePanel, setActivePanel] = useState(null); // "messages" | "notifications" | null

    const openPanel = (panel) => setActivePanel(panel);
    const closePanel = () => setActivePanel(null);

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "var(--bg-base)",
            }}
        >
            {/* ── Left Sidebar ─────────────────────────────────── */}
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
                />
            </aside>

            {/* ── Main Content ─────────────────────────────────── */}
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "1.5rem 1.25rem",
                    gap: "0",
                }}
            >
                {/* Center feed container */}
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

            {/* ── Right Sidebar ─────────────────────────────────── */}
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

            {/* ── Slide Panels ──────────────────────────────────── */}
            <div
                className={`overlay ${activePanel ? "visible" : ""}`}
                onClick={closePanel}
            />
            <MessagesPanel
                open={activePanel === "messages"}
                onClose={closePanel}
            />
            <NotificationsPanel
                open={activePanel === "notifications"}
                onClose={closePanel}
            />

            {/* ── Mobile Bottom Nav ─────────────────────────────── */}
            <MobileBottomNav onOpenPanel={openPanel} />
        </div>
    );
};

/* ── Mobile Bottom Navigation ─────────────────────────────────── */
const MobileBottomNav = ({ onOpenPanel }) => {
    const location = useLocation();

    const navItems = [
        { icon: "🏠", label: "Home", href: "/" },
        { icon: "🔍", label: "Explore", href: "/explore" },
        { icon: "⭕", label: "Circles", href: "/circles" },
        { icon: "🔔", label: "Notifs", panel: "notifications" },
        { icon: "👤", label: "Profile", href: "/profile" },
    ];

    return (
        <nav
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                height: 64,
                background: "var(--sidebar-bg)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                zIndex: 110,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
            className="show-on-mobile"
        >
            {navItems.map((item) => {
                const isActive = item.href
                    ? location.pathname === item.href
                    : false;
                return (
                    <button
                        key={item.label}
                        onClick={() =>
                            item.panel
                                ? onOpenPanel(item.panel)
                                : (window.location.href = item.href)
                        }
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.25rem 0.5rem",
                            borderRadius: 10,
                            color: isActive
                                ? "var(--accent)"
                                : "var(--text-muted)",
                            transition: "color var(--transition-fast)",
                        }}
                    >
                        <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                        <span
                            style={{
                                fontSize: "0.6rem",
                                fontWeight: isActive ? 600 : 400,
                            }}
                        >
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default AppLayout;
