import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import PostEntry from "./PostEntry";

const NewPost = () => {
    const [showPostEntry, setShowPostEntry] = useState(false);
    const { auth } = useAuth();

    // temporarily in NewPost.jsx
    console.log("auth.user:", auth?.user);

    return (
        <>
            <div className="card" style={{ padding: "1rem 1.25rem" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    }}
                >
                    <Avatar user={auth?.user} size="md" />
                    <button
                        onClick={() => setShowPostEntry(true)}
                        style={{
                            flex: 1,
                            textAlign: "left",
                            padding: "0.65rem 1rem",
                            borderRadius: "var(--r-full)",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-strong)",
                            color: "var(--text-muted)",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "all var(--duration) var(--ease)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.color =
                                "var(--text-secondary)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor =
                                "var(--border-strong)";
                            e.currentTarget.style.color = "var(--text-muted)";
                        }}
                    >
                        What's on your mind?
                    </button>

                    {/* Photo shortcut */}
                    <button
                        onClick={() => setShowPostEntry(true)}
                        className="icon-btn"
                        title="Add photo"
                        style={{ flexShrink: 0 }}
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Modal overlay */}
            {showPostEntry && (
                <div
                    className="modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.75)" }}
                >
                    <div className="modal-content w-full max-w-xl">
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
