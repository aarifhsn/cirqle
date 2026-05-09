/* Bio.jsx — Cirqle v2
 * Changes from original:
 * - Replaced hardcoded `border-slate-200 dark:border-slate-900` with CSS var
 * - Slightly improved empty state style
 * - All logic untouched
 */

import { useProfile } from "../../hooks/useProfile";

const Bio = ({ isMe }) => {
    const { state } = useProfile();
    const { user } = state;

    if (!user?.bio && !isMe) return null;

    return (
        <div
            className="mt-3 rounded-xl px-4 py-3"
            style={{
                border: "1px solid var(--border)",
                background: "var(--bg-surface-2)",
            }}
        >
            <p
                className="text-sm leading-relaxed"
                style={{
                    color: user?.bio
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    fontStyle: user?.bio ? "normal" : "italic",
                }}
            >
                {user?.bio || "No bio yet. Click Edit Profile to add one."}
            </p>
        </div>
    );
};

export default Bio;
