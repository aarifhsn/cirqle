import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAxios from "../hooks/useAxios";

/* ── Initials avatar fallback (unchanged) ─────────────────────── */
const InitialsAvatar = ({ name, size = 36, fontSize = "0.8rem" }) => {
    const initials = name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    const hue = (name?.charCodeAt(0) * 37) % 360;
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: `hsl(${hue}, 60%, 55%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
};

/* ── Widget skeleton row ──────────────────────────────────────── */
const SkeletonRow = () => (
    <div className="flex items-center gap-2">
        <div
            className="skeleton flex-shrink-0"
            style={{ width: 36, height: 36, borderRadius: "50%" }}
        />
        <div className="flex-1">
            <div
                className="skeleton mb-1"
                style={{ height: 11, width: "60%", borderRadius: 4 }}
            />
            <div
                className="skeleton"
                style={{ height: 10, width: "40%", borderRadius: 4 }}
            />
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   WIDGET 1 — People Nearby
   ══════════════════════════════════════════════════════════════ */
const NearbyWidget = () => {
    const { api } = useAxios();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState({}); // { userId: bool }

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/users/nearby`)
            .then((r) => {
                const data = r.data?.data ?? r.data ?? [];
                const sorted = [...data].sort((a, b) => {
                    // unfollowed first
                    if (a.isFollowing === b.isFollowing) return 0;
                    return a.isFollowing ? 1 : -1;
                });
                setUsers(sorted.slice(0, 3));
                // seed following state from API response
                const init = {};
                data.forEach((u) => {
                    init[u.id] = u.isFollowing;
                });
                setFollowing(init);
            })
            .catch(() => {
                /* silent — widget just stays empty */
            })
            .finally(() => setLoading(false));
    }, []);

    const handleFollow = async (userId) => {
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/${userId}/follow`,
            );
            if (res.status === 200) {
                setFollowing((prev) => ({
                    ...prev,
                    [userId]: res.data.isFollowing,
                }));
                toast.success(res.data.message);
            }
        } catch {
            toast.error("Failed to update follow.");
        }
    };

    return (
        <div className="widget animate-fade-in">
            <div className="widget-title">
                <span>👥 People Nearby</span>
                <Link to="/nearby">See all</Link>
            </div>

            {loading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}

            {!loading && users.length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    No nearby users found.{" "}
                    <Link to="/nearby" style={{ color: "var(--accent)" }}>
                        Enable location
                    </Link>
                </p>
            )}

            {!loading &&
                users.map((u, i) => (
                    <div
                        key={u.id}
                        className="user-row"
                        style={{ animationDelay: `${i * 60}ms` }}
                    >
                        <InitialsAvatar
                            name={`${u.firstName} ${u.lastName}`}
                            size={38}
                        />
                        <div className="user-row-info">
                            <p className="user-row-name">
                                {u.firstName} {u.lastName}
                            </p>
                            <p className="user-row-sub">
                                {u.distance != null
                                    ? `📍 ${u.distance < 1 ? `${Math.round(u.distance * 1000)}m` : `${u.distance}km`} away`
                                    : u.location_name
                                      ? `📍 ${u.location_name}`
                                      : "@" + u.username}
                            </p>
                        </div>
                        <button
                            onClick={() => handleFollow(u.id)}
                            className="btn btn-secondary btn-sm btn-round"
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.7rem",
                                ...(following[u.id]
                                    ? {
                                          background: "var(--bg-surface-2)",
                                          color: "var(--text-muted)",
                                      }
                                    : {}),
                            }}
                        >
                            {following[u.id] ? "Following" : "Follow"}
                        </button>
                    </div>
                ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   WIDGET 2 — Trending Circles
   ══════════════════════════════════════════════════════════════ */
const CirclesWidget = () => {
    const { api } = useAxios();
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/circles`)
            .then((r) => {
                const data = r.data?.data ?? r.data ?? [];
                // Sort by members_count desc, take top 4
                const sorted = [...data]
                    .sort(
                        (a, b) =>
                            (b.members_count ?? 0) - (a.members_count ?? 0),
                    )
                    .slice(0, 4);
                setCircles(sorted);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const fmtCount = (n) =>
        (n ?? 0) >= 1000 ? `${((n ?? 0) / 1000).toFixed(1)}k` : (n ?? 0);

    return (
        <div
            className="widget animate-fade-in"
            style={{ animationDelay: "80ms" }}
        >
            <div className="widget-title">
                <span>🔥 Trending Circles</span>
                <Link to="/circles">See all</Link>
            </div>

            {loading && [1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}

            {!loading && circles.length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    No circles yet.{" "}
                    <Link to="/circles" style={{ color: "var(--accent)" }}>
                        Create one
                    </Link>
                </p>
            )}

            {!loading &&
                circles.map((c) => (
                    <Link
                        key={c.id}
                        to={`/circles/${c.id}`}
                        className="circle-chip"
                        style={{ textDecoration: "none" }}
                    >
                        <span className="circle-icon">{c.emoji || "⭕"}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                }}
                            >
                                {c.name}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.72rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                {fmtCount(c.members_count)} members
                            </p>
                        </div>
                        {c.is_member && (
                            <span
                                className="pill pill-success"
                                style={{ fontSize: "0.68rem" }}
                            >
                                Joined
                            </span>
                        )}
                    </Link>
                ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   WIDGET 3 — Upcoming Events
   ══════════════════════════════════════════════════════════════ */
const EventsWidget = () => {
    const { api } = useAxios();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/events`)
            .then((r) => {
                const data = r.data?.data ?? r.data ?? [];
                // Sort by start_date asc, take next 2
                const upcoming = [...data]
                    .filter(
                        (e) =>
                            !e.start_date ||
                            new Date(e.start_date) >= new Date(),
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.start_date) - new Date(b.start_date),
                    )
                    .slice(0, 2);
                setEvents(upcoming);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const fmtDate = (d) =>
        new Date(d).toLocaleDateString("en", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });

    return (
        <div
            className="widget animate-fade-in"
            style={{ animationDelay: "160ms" }}
        >
            <div className="widget-title">
                <span>📅 Upcoming Events</span>
                <Link to="/events">See all</Link>
            </div>

            {loading && [1, 2].map((i) => <SkeletonRow key={i} />)}

            {!loading && events.length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    No upcoming events.{" "}
                    <Link to="/events" style={{ color: "var(--accent)" }}>
                        Create one
                    </Link>
                </p>
            )}

            {!loading &&
                events.map((ev) => (
                    <Link
                        key={ev.id}
                        to="/events"
                        style={{ textDecoration: "none" }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: "0.65rem",
                                alignItems: "flex-start",
                                padding: "0.4rem",
                                borderRadius: 10,
                                cursor: "pointer",
                                transition: "background var(--transition-fast)",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "var(--hover-bg)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "transparent")
                            }
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: "var(--accent-soft)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.1rem",
                                    flexShrink: 0,
                                }}
                            >
                                {ev.emoji || "📅"}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p
                                    style={{
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        color: "var(--text-primary)",
                                        lineHeight: 1.3,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {ev.title}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.73rem",
                                        color: "var(--text-muted)",
                                        marginTop: 2,
                                    }}
                                >
                                    {ev.start_date
                                        ? fmtDate(ev.start_date)
                                        : "Date TBD"}
                                    {ev.attendees_count > 0
                                        ? ` · ${ev.attendees_count} going`
                                        : ""}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN RIGHT SIDEBAR
   ══════════════════════════════════════════════════════════════ */
const RightSidebar = () => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            paddingTop: "0",
        }}
    >
        <NearbyWidget />
        <CirclesWidget />
        <EventsWidget />

        <p
            style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                padding: "0 0.25rem",
                lineHeight: 1.8,
            }}
        >
            © 2025 Cirqle · Privacy · Terms · About
        </p>
    </div>
);

export default RightSidebar;
