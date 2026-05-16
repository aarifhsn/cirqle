import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

const CATEGORIES = [
    "All",
    "Local",
    "Career",
    "Education",
    "Lifestyle",
    "Health",
    "Tech",
    "Art",
];
const CIRCLE_EMOJIS = [
    "⭕",
    "🏙️",
    "🌿",
    "💼",
    "🎓",
    "🍜",
    "💪",
    "💻",
    "📷",
    "🤝",
    "🚀",
    "🎵",
    "📚",
    "🎮",
    "✈️",
    "🏠",
];

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem" }}>
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="skeleton flex-shrink-0"
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                    />
                    <div className="flex-1">
                        <div
                            className="skeleton mb-2"
                            style={{
                                height: 13,
                                width: "60%",
                                borderRadius: 6,
                            }}
                        />
                        <div
                            className="skeleton"
                            style={{
                                height: 11,
                                width: "35%",
                                borderRadius: 6,
                            }}
                        />
                    </div>
                </div>
                <div
                    className="skeleton mb-3"
                    style={{ height: 11, width: "85%", borderRadius: 6 }}
                />
                <div
                    className="skeleton"
                    style={{ height: 34, borderRadius: 10 }}
                />
            </div>
        ))}
    </div>
);

/* ── Error banner ─────────────────────────────────────────────── */
const ErrorBanner = ({ message, onRetry }) => (
    <div
        className="card flex items-center justify-between gap-3 p-4"
        style={{
            background: "var(--danger-soft)",
            border: "1px solid rgba(239,68,68,0.2)",
        }}
    >
        <p className="text-sm" style={{ color: "var(--danger)" }}>
            {message}
        </p>
        <button
            onClick={onRetry}
            className="btn btn-ghost btn-sm flex-shrink-0"
        >
            Retry
        </button>
    </div>
);

/* ── Circle Card ──────────────────────────────────────────────── */
const CircleCard = ({ circle: initial }) => {
    const [circle, setCircle] = useState(initial);
    const [joining, setJoining] = useState(false);
    const { api } = useAxios();

    const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/circles/${circle.id}/join`,
            );
            if (res.status === 200) {
                setCircle((c) => ({
                    ...c,
                    is_member: res.data.is_member ?? !c.is_member,
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

    return (
        <div
            className="card card-hover flex flex-col"
            style={{ padding: "1.25rem" }}
        >
            <div className="flex items-start gap-3 mb-3">
                <div
                    className="flex-center flex-shrink-0"
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: "var(--accent-soft)",
                        fontSize: "1.5rem",
                    }}
                >
                    {circle.emoji || "⭕"}
                </div>
                <div className="flex-1 min-w-0">
                    <Link
                        to={`/circles/${circle.id}`}
                        className="font-bold text-sm block truncate transition-colors"
                        style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--accent)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                                "var(--text-primary)")
                        }
                    >
                        {circle.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                        {circle.category && (
                            <span
                                className="pill pill-muted"
                                style={{ fontSize: "0.68rem" }}
                            >
                                {circle.category}
                            </span>
                        )}
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {fmtCount(circle.members_count ?? 0)} members
                        </span>
                    </div>
                </div>
                {circle.is_member && (
                    <span
                        className="pill pill-success flex-shrink-0"
                        style={{ fontSize: "0.68rem" }}
                    >
                        Joined
                    </span>
                )}
            </div>

            <p
                className="text-xs mb-4 leading-relaxed"
                style={{ color: "var(--text-secondary)", flex: 1 }}
            >
                {circle.description || "No description."}
            </p>

            {circle.posts_count > 0 && (
                <p
                    className="text-xs mb-3"
                    style={{ color: "var(--text-muted)" }}
                >
                    📝 {circle.posts_count} posts
                </p>
            )}

            <div className="flex gap-2">
                <Link
                    to={`/circles/${circle.id}`}
                    className="btn btn-ghost btn-sm flex-1"
                >
                    View
                </Link>
                <button
                    onClick={handleJoin}
                    disabled={joining}
                    className={`btn btn-sm flex-1 ${circle.is_member ? "btn-ghost" : "btn-primary"}`}
                    style={
                        circle.is_member
                            ? {
                                  color: "var(--danger)",
                                  borderColor: "var(--danger)",
                              }
                            : {}
                    }
                >
                    {joining ? (
                        <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                        </svg>
                    ) : circle.is_member ? (
                        "Leave"
                    ) : (
                        "Join"
                    )}
                </button>
            </div>
        </div>
    );
};

/* ── Create Circle Modal ──────────────────────────────────────── */
const CreateCircleModal = ({ onClose, onCreated }) => {
    const { api } = useAxios();
    const [form, setForm] = useState({
        name: "",
        description: "",
        emoji: "⭕",
        category: "Local",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/circles`,
                form,
            );
            if (res.status === 200 || res.status === 201) {
                toast.success("Circle created!");
                onCreated(res.data?.data ?? res.data);
            }
        } catch (e) {
            setError(e.response?.data?.message ?? "Failed to create circle.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "var(--bg-overlay)" }}
        >
            <div
                className="card w-full max-w-md animate-fade-in-scale"
                style={{ padding: "1.75rem" }}
            >
                <div
                    className="flex items-center justify-between mb-5 pb-4"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <h2
                        className="font-bold"
                        style={{
                            fontSize: "1.1rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        Create a Circle
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div
                        className="mb-3 px-3 py-2 rounded-xl text-sm"
                        style={{
                            background: "var(--danger-soft)",
                            color: "var(--danger)",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-xs font-semibold mb-2"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CIRCLE_EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() =>
                                        setForm((f) => ({ ...f, emoji: e }))
                                    }
                                    className="flex-center"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 8,
                                        fontSize: "1.2rem",
                                        border: `2px solid ${form.emoji === e ? "var(--accent)" : "var(--border)"}`,
                                        background:
                                            form.emoji === e
                                                ? "var(--accent-soft)"
                                                : "transparent",
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Name
                        </label>
                        <input
                            className="input"
                            required
                            placeholder="Circle name"
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Category
                        </label>
                        <select
                            className="input"
                            value={form.category}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    category: e.target.value,
                                }))
                            }
                        >
                            {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-5">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Description
                        </label>
                        <textarea
                            className="input"
                            rows={3}
                            style={{ resize: "none" }}
                            placeholder="What's this circle about?"
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary flex-1"
                        >
                            {saving ? "Creating…" : "Create Circle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── CirclesPage ──────────────────────────────────────────────── */
const CirclesPage = () => {
    const { api } = useAxios();

    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [showCreate, setShowCreate] = useState(false);

    const fetchCircles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/circles`,
            );
            setCircles(res.data?.data ?? res.data ?? []);
        } catch (e) {
            setError(e.response?.data?.message ?? "Failed to load circles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCircles();
    }, []);

    const filtered = circles.filter((c) => {
        const matchSearch = `${c.name} ${c.description ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchCategory = category === "All" || c.category === category;
        return matchSearch && matchCategory;
    });

    const myCircles = filtered.filter((c) => c.is_member);
    const otherCircles = filtered.filter((c) => !c.is_member);

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: "1.3rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        ⭕ Circles
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Communities around you
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn btn-primary btn-sm"
                >
                    + Create Circle
                </button>
            </div>

            {/* Search */}
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
                    placeholder="Search circles…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="btn btn-sm btn-round"
                        style={
                            category === cat
                                ? { background: "var(--accent)", color: "#fff" }
                                : {
                                      background: "var(--bg-surface-2)",
                                      color: "var(--text-muted)",
                                      border: "1px solid var(--border)",
                                  }
                        }
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && <ErrorBanner message={error} onRetry={fetchCircles} />}

            {/* Skeleton */}
            {loading && <Skeleton />}

            {/* Content */}
            {!loading && !error && (
                <>
                    {myCircles.length > 0 && (
                        <div>
                            <p className="section-label mb-3">My Circles</p>
                            <div
                                className="grid gap-3"
                                style={{
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(280px, 1fr))",
                                }}
                            >
                                {myCircles.map((c) => (
                                    <CircleCard key={c.id} circle={c} />
                                ))}
                            </div>
                        </div>
                    )}

                    {otherCircles.length > 0 && (
                        <div>
                            <p className="section-label mb-3">Discover</p>
                            <div
                                className="grid gap-3"
                                style={{
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(280px, 1fr))",
                                }}
                            >
                                {otherCircles.map((c) => (
                                    <CircleCard key={c.id} circle={c} />
                                ))}
                            </div>
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div
                            className="card flex-center flex-col"
                            style={{
                                padding: "4rem 2rem",
                                textAlign: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "2.5rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                ⭕
                            </span>
                            <h3
                                className="font-semibold mb-1"
                                style={{ color: "var(--text-primary)" }}
                            >
                                No circles found
                            </h3>
                            <p
                                className="text-sm mb-4"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Try a different search or create one.
                            </p>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="btn btn-primary btn-sm"
                            >
                                Create Circle
                            </button>
                        </div>
                    )}
                </>
            )}

            {showCreate && (
                <CreateCircleModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(c) => {
                        setCircles((prev) => [c, ...prev]);
                        setShowCreate(false);
                    }}
                />
            )}
        </AppLayout>
    );
};

export default CirclesPage;
