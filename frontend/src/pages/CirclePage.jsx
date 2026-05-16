import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "../components/common/Avatar";
import PostList from "../components/posts/PostList";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

const CIRCLE_TABS = [
    { id: "posts", label: "Posts", icon: "📝" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "about", label: "About", icon: "ℹ️" },
];

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="flex flex-col gap-3">
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
                className="skeleton"
                style={{ height: 160, borderRadius: 0 }}
            />
            <div style={{ padding: "1.25rem 1.4rem" }}>
                <div
                    className="skeleton mb-2"
                    style={{ height: 22, width: "40%", borderRadius: 6 }}
                />
                <div
                    className="skeleton mb-1"
                    style={{ height: 13, width: "70%", borderRadius: 6 }}
                />
                <div
                    className="skeleton"
                    style={{ height: 13, width: "50%", borderRadius: 6 }}
                />
            </div>
        </div>
    </div>
);

/* ── Error ────────────────────────────────────────────────────── */
const ErrorState = ({ message, onRetry }) => (
    <div
        className="card flex-center flex-col"
        style={{
            padding: "3rem 2rem",
            textAlign: "center",
            background: "var(--danger-soft)",
            border: "1px solid rgba(239,68,68,0.2)",
        }}
    >
        <span style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚠️</span>
        <p className="font-semibold mb-3" style={{ color: "var(--danger)" }}>
            {message}
        </p>
        <button onClick={onRetry} className="btn btn-ghost btn-sm">
            Try Again
        </button>
    </div>
);

/* ── CirclePage ───────────────────────────────────────────────── */
const CirclePage = () => {
    const { id } = useParams();
    const { api } = useAxios();

    const [circle, setCircle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");
    const [memberSearch, setMemberSearch] = useState("");

    const fetchCircle = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/circles/${id}`,
            );
            setCircle(res.data?.data ?? res.data);
        } catch (e) {
            setError(
                e.response?.data?.message ?? "Failed to load this circle.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircle();
    }, [id]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/circles/${id}/join`,
            );
            if (res.status === 200) {
                setCircle((c) => ({
                    ...c,
                    is_member: res.data.is_member,
                    members_count:
                        res.data.members_count ??
                        (c.is_member
                            ? c.members_count - 1
                            : c.members_count + 1),
                }));
                toast.success(
                    res.data.message ??
                        (circle.is_member ? "Left circle" : "Joined!"),
                );
            }
        } catch (e) {
            toast.error(
                e.response?.data?.message ?? "Failed to update membership.",
            );
        } finally {
            setJoining(false);
        }
    };

    const fmtCount = (n) =>
        (n ?? 0) >= 1000 ? `${((n ?? 0) / 1000).toFixed(1)}k` : (n ?? 0);

    const filteredMembers = (circle?.members ?? []).filter((m) =>
        `${m.firstName} ${m.lastName} ${m.username}`
            .toLowerCase()
            .includes(memberSearch.toLowerCase()),
    );

    return (
        <AppLayout>
            {loading && <Skeleton />}
            {!loading && error && (
                <ErrorState message={error} onRetry={fetchCircle} />
            )}

            {!loading && !error && circle && (
                <>
                    {/* ── Hero card ─────────────────────────────── */}
                    <div
                        className="card animate-fade-in"
                        style={{ padding: 0, overflow: "hidden" }}
                    >
                        {/* Cover */}
                        <div
                            className="w-full flex-center"
                            style={{
                                height: 140,
                                background: circle.cover
                                    ? `url(${import.meta.env.VITE_STORAGE_URL}/${circle.cover}) center/cover`
                                    : "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
                            }}
                        >
                            <span style={{ fontSize: "3rem" }}>
                                {circle.emoji || "⭕"}
                            </span>
                        </div>

                        <div style={{ padding: "1.25rem 1.4rem" }}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1
                                            className="font-bold"
                                            style={{
                                                fontSize: "1.3rem",
                                                color: "var(--text-primary)",
                                                fontFamily:
                                                    "var(--font-display)",
                                            }}
                                        >
                                            {circle.name}
                                        </h1>
                                        {circle.is_member && (
                                            <span
                                                className="pill pill-success"
                                                style={{ fontSize: "0.68rem" }}
                                            >
                                                Joined
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        className="flex items-center gap-3 text-xs"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {circle.category && (
                                            <span className="pill pill-muted">
                                                {circle.category}
                                            </span>
                                        )}
                                        <span>
                                            👥 {fmtCount(circle.members_count)}{" "}
                                            members
                                        </span>
                                        {circle.posts_count > 0 && (
                                            <span>
                                                📝 {circle.posts_count} posts
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className={`btn btn-sm flex-shrink-0 ${circle.is_member ? "btn-ghost" : "btn-primary"}`}
                                    style={
                                        circle.is_member
                                            ? {
                                                  color: "var(--danger)",
                                                  borderColor: "var(--danger)",
                                              }
                                            : {}
                                    }
                                >
                                    {joining
                                        ? "…"
                                        : circle.is_member
                                          ? "Leave Circle"
                                          : "Join Circle"}
                                </button>
                            </div>

                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {circle.description}
                            </p>
                        </div>
                    </div>

                    {/* ── Tabs ──────────────────────────────────── */}
                    <div className="feed-tabs">
                        {CIRCLE_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`feed-tab ${activeTab === tab.id ? "active" : ""}`}
                            >
                                <span>{tab.icon}</span>
                                <span className="hidden sm:inline">
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* ── Posts tab ─────────────────────────────── */}
                    {activeTab === "posts" && (
                        <div className="animate-fade-in">
                            {circle.posts?.length > 0 ? (
                                <PostList posts={circle.posts} />
                            ) : (
                                <div
                                    className="card flex-center flex-col"
                                    style={{
                                        padding: "3rem 2rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "2rem",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        📝
                                    </span>
                                    <p
                                        className="font-semibold mb-1"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        No posts yet
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {circle.is_member
                                            ? "Be the first to post in this circle!"
                                            : "Join this circle to see and create posts."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Members tab ───────────────────────────── */}
                    {activeTab === "members" && (
                        <div className="flex flex-col gap-3 animate-fade-in">
                            <div className="relative">
                                <span
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    className="input"
                                    style={{ paddingLeft: "2.25rem" }}
                                    placeholder="Search members…"
                                    value={memberSearch}
                                    onChange={(e) =>
                                        setMemberSearch(e.target.value)
                                    }
                                />
                            </div>

                            {filteredMembers.length === 0 && (
                                <div
                                    className="card flex-center"
                                    style={{
                                        padding: "2rem",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        className="text-sm"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        No members found.
                                    </p>
                                </div>
                            )}

                            {filteredMembers.map((m) => (
                                <div
                                    key={m.id}
                                    className="card card-hover flex items-center gap-3 p-4"
                                >
                                    <Link
                                        to={`/${m.username}`}
                                        className="flex-shrink-0"
                                    >
                                        <Avatar user={m} size="md" />
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/${m.username}`}
                                            className="block font-semibold text-sm truncate transition-colors"
                                            style={{
                                                color: "var(--text-primary)",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.color =
                                                    "var(--accent)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.color =
                                                    "var(--text-primary)")
                                            }
                                        >
                                            {m.firstName} {m.lastName}
                                        </Link>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            @{m.username}
                                        </p>
                                    </div>
                                    {m.role === "admin" && (
                                        <span
                                            className="pill pill-accent"
                                            style={{ fontSize: "0.68rem" }}
                                        >
                                            Admin
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── About tab ─────────────────────────────── */}
                    {activeTab === "about" && (
                        <div
                            className="card animate-fade-in"
                            style={{ padding: "1.5rem" }}
                        >
                            <h3
                                className="font-bold mb-3"
                                style={{
                                    color: "var(--text-primary)",
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                About {circle.name}
                            </h3>
                            <p
                                className="text-sm leading-relaxed mb-4"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {circle.description}
                            </p>
                            <div className="divider" />
                            <div className="flex flex-col gap-3 mt-3">
                                {[
                                    {
                                        label: "Category",
                                        value: circle.category ?? "—",
                                    },
                                    {
                                        label: "Members",
                                        value: fmtCount(circle.members_count),
                                    },
                                    {
                                        label: "Posts",
                                        value: circle.posts_count ?? 0,
                                    },
                                    {
                                        label: "Your status",
                                        value: circle.is_member
                                            ? "✅ Member"
                                            : "Not a member",
                                    },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        className="flex items-center justify-between"
                                    >
                                        <span
                                            className="text-sm"
                                            style={{
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            {row.label}
                                        </span>
                                        <span
                                            className="text-sm font-semibold"
                                            style={{
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
};

export default CirclePage;
