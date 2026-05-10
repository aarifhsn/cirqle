/* NearbyPage.jsx — Cirqle
 * Fetches GET /users/nearby?radius=10
 * Falls back to mock data if endpoint not ready.
 * To go live: remove MOCK_USERS and the catch fallback.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "../components/common/Avatar";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

/* ── Mock data (remove when backend ready) ────────────────────── */
const MOCK_USERS = [
    {
        id: 1,
        firstName: "Nadia",
        lastName: "Rahman",
        username: "nadia_r",
        avatar: null,
        location_name: "Mirpur, Dhaka",
        distance: 0.8,
        isFollowing: false,
    },
    {
        id: 2,
        firstName: "Arif",
        lastName: "Hossain",
        username: "arifh",
        avatar: null,
        location_name: "Gulshan, Dhaka",
        distance: 1.4,
        isFollowing: true,
    },
    {
        id: 3,
        firstName: "Lamia",
        lastName: "Sultana",
        username: "lamia_s",
        avatar: null,
        location_name: "Dhanmondi",
        distance: 2.1,
        isFollowing: false,
    },
    {
        id: 4,
        firstName: "Karim",
        lastName: "Uddin",
        username: "karim_u",
        avatar: null,
        location_name: "Mohammadpur",
        distance: 3.5,
        isFollowing: false,
    },
    {
        id: 5,
        firstName: "Sadia",
        lastName: "Islam",
        username: "sadia_i",
        avatar: null,
        location_name: "Uttara, Dhaka",
        distance: 5.2,
        isFollowing: false,
    },
    {
        id: 6,
        firstName: "Rahim",
        lastName: "Ali",
        username: "rahim_a",
        avatar: null,
        location_name: "Banani, Dhaka",
        distance: 6.8,
        isFollowing: true,
    },
];

const RADIUS_OPTIONS = [
    { label: "1 km", value: 1 },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
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

/* ── User Card ────────────────────────────────────────────────── */
const NearbyUserCard = ({ person, onFollowToggle }) => {
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
        } catch {
            toast.error("Failed to update follow.");
        }
    };

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
                <p
                    className="text-xs mt-0.5 flex items-center gap-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    <span>📍</span> {person.location_name}
                </p>
            </div>

            {/* Distance badge */}
            <span className="pill pill-accent flex-shrink-0 text-xs">
                {person.distance < 1
                    ? `${Math.round(person.distance * 1000)}m`
                    : `${person.distance.toFixed(1)}km`}
            </span>

            {/* Follow button */}
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
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radius, setRadius] = useState(10);
    const [locating, setLocating] = useState(false);
    const [locationOk, setLocationOk] = useState(false);
    const [search, setSearch] = useState("");

    const fetchNearby = async (r) => {
        setLoading(true);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/nearby?radius=${r}`,
            );
            setUsers(res.data?.data ?? res.data ?? []);
        } catch {
            // ── MOCK fallback — remove when backend ready ──
            setUsers(MOCK_USERS.filter((u) => u.distance <= r));
        } finally {
            setLoading(false);
        }
    };

    /* Request geolocation then fetch */
    const requestLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported by your browser.");
            return;
        }
        setLocating(true);
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
                    /* silent */
                }
                setLocationOk(true);
                setLocating(false);
                fetchNearby(radius);
            },
            () => {
                toast.error("Location access denied. Using mock data.");
                setLocating(false);
                setLocationOk(true);
                fetchNearby(radius);
            },
        );
    };

    useEffect(() => {
        requestLocation();
    }, []);
    useEffect(() => {
        if (locationOk) fetchNearby(radius);
    }, [radius]);

    const filtered = users.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.username}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

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
                        📍 People Nearby
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Discover people in your neighborhood
                    </p>
                </div>

                {/* Radius selector */}
                <div className="flex items-center gap-2">
                    {RADIUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setRadius(opt.value)}
                            className="btn btn-sm"
                            style={
                                radius === opt.value
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
                            {opt.label}
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

            {/* Count */}
            {!loading && filtered.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "person" : "people"} within{" "}
                    {radius}km
                </p>
            )}

            {/* Content */}
            {loading && <Skeleton />}

            {!loading && filtered.length === 0 && (
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
                        Try increasing the radius or check back later.
                    </p>
                    <button
                        onClick={() => setRadius(50)}
                        className="btn btn-primary btn-sm"
                    >
                        Expand to 50km
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
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
