import { useEffect, useState } from "react";
import MobileHeader from "../components/common/MobileHeader";
import useAxios from "../hooks/useAxios";
import LeftSidebar from "./LeftSidebar";
import MessagesPanel, { NotificationsPanel } from "./MessagesPanel";
import RightSidebar from "./RightSidebar";

const AppLayout = ({ children, hideRightSidebar = false }) => {
    const { api } = useAxios();
    const [activePanel, setActivePanel] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [mobileRightSidebarOpen, setMobileRightSidebarOpen] = useState(false);

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
        setMobileSidebarOpen(false);
    };
    const closePanel = () => setActivePanel(null);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                background: "var(--bg-base)",
                maxWidth: "var(--max-content-width)",
                margin: "0 auto",
            }}
        >
            {/* ── Mobile top header (hidden on desktop) ─────────── */}
            <MobileHeader
                onOpenSidebar={() => setMobileSidebarOpen(true)}
                onOpenRightSidebar={() => setMobileRightSidebarOpen(true)}
            />

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

            {/* ── Mobile Sidebar Drawer ─────────────────────────────── */}
            {mobileSidebarOpen && (
                <div
                    className="show-on-mobile"
                    onClick={() => setMobileSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 200,
                        background: "var(--bg-overlay)",
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}
            <div
                className="show-on-mobile"
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "280px",
                    zIndex: 201,
                    background: "var(--sidebar-bg)",
                    borderRight: "1px solid var(--sidebar-border)",
                    transform: mobileSidebarOpen
                        ? "translateX(0)"
                        : "translateX(-100%)",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowY: "auto",
                    overflowX: "hidden",
                    maxWidth: "100%",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "1.5rem",
                        right: "1rem",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                    }}
                >
                    <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => setMobileSidebarOpen(false)}
                    >
                        <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <LeftSidebar
                    onOpenPanel={openPanel}
                    activePanel={activePanel}
                    unreadCount={unreadCount}
                    unreadMessagesCount={unreadMessages}
                    onNavigate={() => setMobileSidebarOpen(false)}
                />
            </div>

            {/* ── Mobile Right Sidebar Drawer ──────────────────────────── */}
            {mobileRightSidebarOpen && (
                <div
                    className="show-on-mobile"
                    onClick={() => setMobileRightSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 200,
                        background: "var(--bg-overlay)",
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}
            <div
                className="show-on-mobile"
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    minWidth: "280px",
                    zIndex: 201,
                    background: "var(--sidebar-bg)",
                    borderLeft: "1px solid var(--sidebar-border)",
                    transform: mobileRightSidebarOpen
                        ? "translateX(0)"
                        : "translateX(100%)",
                    transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "2rem",
                }}
            >
                {/* Close button */}
                <div className="absolute top-2 right-2 z-50 cursor-pointer text-gray-500">
                    <button
                        className="btn btn-ghost btn-icon btn-icon-sm"
                        onClick={() => setMobileRightSidebarOpen(false)}
                    >
                        <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                {/* Reuse RightSidebar content */}
                <RightSidebar />
            </div>
        </div>
    );
};

export default AppLayout;
