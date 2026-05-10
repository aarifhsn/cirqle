import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import PostEntry from "./PostEntry";

/* ── Composer action buttons config ──────────────────────────── */
const COMPOSER_ACTIONS = [
    { icon: "📷", label: "Photo", color: "#6C63FF" },
    { icon: "📊", label: "Poll", color: "#43CFAA" },
    { icon: "😊", label: "Mood", color: "#F59E0B" },
    { icon: "💼", label: "Job", color: "#3B82F6" },
    { icon: "📅", label: "Event", color: "#EF4444" },
    { icon: "🛍️", label: "Sell", color: "#EC4899" },
];

const NewPost = () => {
    const [showPostEntry, setShowPostEntry] = useState(false);
    const { auth } = useAuth();

    return (
        <>
            {/* ── Composer Card ─────────────────────────────────── */}
            <div
                className="card animate-fade-in"
                style={{ padding: "1rem 1.25rem" }}
            >
                {/* Top row: avatar + prompt input */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                        <Avatar user={auth?.user} size="md" />
                        <span className="online-dot" />
                    </div>

                    <button
                        onClick={() => setShowPostEntry(true)}
                        className="flex-1 text-left px-4 py-2.5 rounded-full text-sm transition-all"
                        style={{
                            background: "var(--input-bg)",
                            border: "1.5px solid var(--border)",
                            color: "var(--text-muted)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.background =
                                "var(--input-bg-focus)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background =
                                "var(--input-bg)";
                        }}
                    >
                        Share something with your circle...
                    </button>
                </div>

                {/* Divider */}
                <div className="divider" />

                {/* Action buttons row */}
                <div className="flex items-center gap-1 flex-wrap">
                    {COMPOSER_ACTIONS.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => setShowPostEntry(true)}
                            className="compose-action flex-1"
                            style={{ minWidth: "fit-content" }}
                            title={action.label}
                        >
                            <span style={{ fontSize: "1rem" }}>
                                {action.icon}
                            </span>
                            <span className="hidden sm:inline text-xs font-medium">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Modal (unchanged) ─────────────────────────────── */}
            {showPostEntry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "var(--bg-overlay)" }}
                >
                    <div className="w-full max-w-xl animate-fade-in-scale">
                        <PostEntry
                            onCreate={() => setShowPostEntry(false)}
                            onClose={() => setShowPostEntry(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default NewPost;
