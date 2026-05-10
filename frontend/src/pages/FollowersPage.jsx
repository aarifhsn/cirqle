/* FollowersPage.jsx — Cirqle v2
 * Changes:
 * - PageLayout → AppLayout
 * - bg-lighterDark, text-lwsGreen, text-white, text-gray-* → CSS vars
 * - Skeleton uses .skeleton class
 * - All API logic 100% untouched
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UserCard from "../components/common/UseCard";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

/* ── Shared skeleton ──────────────────────────────────────────── */
const UserListSkeleton = () => (
    <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
                <div
                    className="skeleton flex-shrink-0"
                    style={{ width: 44, height: 44, borderRadius: "50%" }}
                />
                <div className="flex-1">
                    <div
                        className="skeleton mb-2"
                        style={{ height: 12, width: "40%", borderRadius: 6 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 10, width: "25%", borderRadius: 6 }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* ── Back button ──────────────────────────────────────────────── */
const BackButton = ({ to }) => (
    <Link
        to={to}
        className="flex-center"
        style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            flexShrink: 0,
            transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--hover-bg)";
            e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-surface-2)";
            e.currentTarget.style.color = "var(--text-secondary)";
        }}
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
                d="M15 19l-7-7 7-7"
            />
        </svg>
    </Link>
);

/* ── Empty state ──────────────────────────────────────────────── */
const EmptyUsers = ({ label, action }) => (
    <div
        className="card flex-center flex-col"
        style={{ padding: "4rem 2rem", textAlign: "center" }}
    >
        <div
            className="flex-center mb-4"
            style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--accent-soft)",
            }}
        >
            <span style={{ fontSize: "1.5rem" }}>👥</span>
        </div>
        <p
            className="font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
        >
            {label}
        </p>
        {action}
    </div>
);

/* ── FollowersPage ────────────────────────────────────────────── */
const FollowersPage = () => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const { username } = useParams();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/${username}/followers`)
            .then((r) => {
                setFollowers(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <BackButton to={`/${username}`} />
                <div>
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: "1.2rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        Followers
                    </h1>
                    <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {auth?.user?.username === username
                            ? "People who follow you"
                            : `People who follow @${username}`}
                    </p>
                </div>
            </div>

            {loading && <UserListSkeleton />}

            {!loading && followers.length === 0 && (
                <EmptyUsers
                    label="No followers yet"
                    action={
                        <p
                            className="text-sm"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Share your profile to get followers
                        </p>
                    }
                />
            )}

            {!loading && followers.length > 0 && (
                <div className="flex flex-col gap-2">
                    {followers.map((person) => (
                        <UserCard key={person.id} person={person} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
};

export default FollowersPage;
