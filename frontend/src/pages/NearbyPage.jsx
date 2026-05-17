import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "../components/common/Avatar";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

const RADIUS_OPTIONS = [
    { label: "All", value: 99999 }, // show everyone
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "25", value: 25 },
    { label: "50", value: 50 },
];

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card flex items-center gap-3 p-4">
                <div
                    className="skeleton flex-shrink-0"
                    style={{ width: 48, height: 48, borderRadius: "50%" }}
                />
                <div className="flex-1">
                    <div
                        className="skeleton mb-2"
                        style={{ height: 13, width: "40%", borderRadius: 6 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 11, width: "28%", borderRadius: 6 }}
                    />
                </div>
                <div
                    className="skeleton"
                    style={{ width: 72, height: 32, borderRadius: 20 }}
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

/* ── Nearby User Card ─────────────────────────────────────────── */
const NearbyUserCard = ({ person }) => {
    const [following, setFollowing] = useState(person.isFollowing);
    const [hovered, setHovered] = useState(false);
    const { api } = useAxios();

    const handleFollow = async () => {
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/${person.id}/follow`,
            );
            if (res.status === 200) {
                setFollowing(res.data.isFollowing);
                toast.success(res.data.message);
            }
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to vote.");
        }
    };

    const distLabel =
        person.distance < 1
            ? `${Math.round(person.distance * 1000)}m`
            : `${Number(person.distance).toFixed(1)}km`;

    return (
        <div className="card card-hover flex items-center gap-3 p-4">
            <Link to={`/${person.username}`} className="flex-shrink-0">
                <Avatar user={person} size="md" />
            </Link>

            <div className="flex-1 min-w-0">
                <Link
                    to={`/${person.username}`}
                    className="block font-semibold text-sm truncate transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--accent)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-primary)")
                    }
                >
                    {person.firstName} {person.lastName}
                </Link>
                {person.location_name && (
                    <p
                        className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ color: "var(--text-muted)" }}
                    >
                        📍 {person.location_name}
                    </p>
                )}
            </div>

            <span className="pill pill-accent flex-shrink-0 text-xs">
                {distLabel}
            </span>

            <button
                onClick={handleFollow}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`btn btn-sm btn-round flex-shrink-0 ${following ? "" : "btn-primary"}`}
                style={
                    following
                        ? {
                              background: hovered
                                  ? "var(--danger-soft)"
                                  : "var(--bg-surface-2)",
                              color: hovered
                                  ? "var(--danger)"
                                  : "var(--text-secondary)",
                              border: `1px solid ${hovered ? "var(--danger)" : "var(--border)"}`,
                          }
                        : {}
                }
            >
                {following ? (hovered ? "Unfollow" : "Following") : "+ Follow"}
            </button>
        </div>
    );
};

/* ── NearbyPage ───────────────────────────────────────────────── */
const NearbyPage = () => {
    const { api } = useAxios();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [radius, setRadius] = useState(10);
    const [locating, setLocating] = useState(false);
    const [locationSet, setLocationSet] = useState(false);
    const [search, setSearch] = useState("");
    const [allUsers, setAllUsers] = useState([]);

    /* ── Step 1: request browser location, save to backend ─────── */
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    await api.patch(
                        `${import.meta.env.VITE_SERVER_BASE_URL}/users/location`,
                        {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        },
                    );
                } catch {
                    /* location save failed — fetch anyway using server-stored coords */
                }
                setLocationSet(true);
                setLocating(false);
            },

            (err) => {
                setLocating(false);
                setLocationSet(true);
                if (err.code === 1) {
                    setError(
                        "Location access denied. Enable location to see nearby people.",
                    );
                } else {
                    setError("Could not get your location.");
                }
            },
            { timeout: 10000 },
        );
    };

    /* ── Step 2: fetch nearby users once location is set ────────── */
    const fetchNearby = async (r) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/nearby`,
            );
            setAllUsers(res.data?.data ?? res.data ?? []);
        } catch (e) {
            const msg =
                e.response?.data?.message ?? "Failed to load nearby people.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    /* On mount — request location */
    useEffect(() => {
        requestLocation();
    }, []);

    /* Fetch once location is confirmed */
    useEffect(() => {
        if (locationSet) fetchNearby();
    }, [locationSet]);

    // Client-side radius filter
    const users =
        radius === 99999
            ? allUsers
            : allUsers.filter((u) => u.distance <= radius);

    const filtered = users.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.username}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: "1.3rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        📍 People Nearby
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Discover people in your neighborhood
                    </p>
                </div>

                {/* Radius pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {RADIUS_OPTIONS.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRadius(r.value)}
                            className="btn btn-sm btn-round"
                            style={
                                radius === r.value
                                    ? {
                                          background: "var(--accent)",
                                          color: "#fff",
                                      }
                                    : {
                                          background: "var(--bg-surface-2)",
                                          color: "var(--text-muted)",
                                          border: "1px solid var(--border)",
                                      }
                            }
                        >
                            {r.label} {r.value === 99999 ? "🌎" : "km"}
                        </button>
                    ))}
                </div>
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
                    placeholder="Search nearby people…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Locating banner */}
            {locating && (
                <div
                    className="card flex items-center gap-3 p-4"
                    style={{
                        background: "var(--accent-soft)",
                        border: "1px solid var(--accent)",
                    }}
                >
                    <svg
                        className="w-4 h-4 animate-spin flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ color: "var(--accent)" }}
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
                    <p
                        className="text-sm font-medium"
                        style={{ color: "var(--accent)" }}
                    >
                        Getting your location…
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <ErrorBanner
                    message={error}
                    onRetry={
                        locationSet
                            ? () => fetchNearby(radius)
                            : requestLocation
                    }
                />
            )}

            {/* Count */}
            {!loading && !error && filtered.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "person" : "people"}
                    {radius === 99999 ? " total" : ` within ${radius}km`}
                </p>
            )}

            {/* Skeleton */}
            {loading && <Skeleton />}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && locationSet && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
                >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                        📍
                    </span>
                    <h3
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        No one nearby
                    </h3>
                    <p
                        className="text-sm mb-4"
                        style={{ color: "var(--text-muted)", maxWidth: 260 }}
                    >
                        Try increasing the search radius.
                    </p>
                    <button
                        onClick={() => setRadius(50)}
                        className="btn btn-primary btn-sm"
                    >
                        Expand to 50km
                    </button>
                </div>
            )}

            {/* Results */}
            {!loading && !error && filtered.length > 0 && (
                <div className="flex flex-col gap-2 animate-fade-in">
                    {filtered.map((u) => (
                        <NearbyUserCard key={u.id} person={u} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
};

export default NearbyPage;
