/* RightSidebar.jsx
 * Cirqle — Right sidebar with widgets
 * Suggested users | Trending circles | Upcoming events | Online
 */

import { Link } from "react-router-dom";

/* ── Placeholder data (wire to API later) ─────────────────────── */
const SUGGESTED_USERS = [
    {
        id: 1,
        name: "Nadia Rahman",
        username: "nadia_r",
        location: "Mirpur, Dhaka",
        avatar: null,
    },
    {
        id: 2,
        name: "Arif Hossain",
        username: "arifh",
        location: "Gulshan, Dhaka",
        avatar: null,
    },
    {
        id: 3,
        name: "Lamia Sultana",
        username: "lamia_s",
        location: "Dhanmondi",
        avatar: null,
    },
];

const TRENDING_CIRCLES = [
    { emoji: "⌂", name: "Dhaka Circle", members: "12.4k", active: true },
    { emoji: "◧", name: "Job Seekers", members: "8.2k", active: false },
    { emoji: "◌", name: "Food Lovers", members: "3.1k", active: true },
    { emoji: "▲", name: "Fitness Circle", members: "2.4k", active: false },
];

const UPCOMING_EVENTS = [
    {
        id: 1,
        title: "Tech Meetup Dhaka",
        date: "Sat, 14 Jun",
        emoji: "💻",
        attendees: 42,
    },
    {
        id: 2,
        title: "Photography Walk",
        date: "Sun, 15 Jun",
        emoji: "📷",
        attendees: 18,
    },
];

/* ── Initials avatar fallback ─────────────────────────────────── */
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

/* ── Follow Button ────────────────────────────────────────────── */
const SmallFollowBtn = () => (
    <button
        className="btn btn-secondary btn-sm btn-round"
        style={{ fontSize: "0.75rem", padding: "0.25rem 0.7rem" }}
    >
        Follow
    </button>
);

/* ── RightSidebar ─────────────────────────────────────────────── */
const RightSidebar = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                paddingTop: "0",
            }}
        >
            {/* ── 1. Suggested Nearby People ────────────────────── */}
            <div className="widget animate-fade-in">
                <div className="widget-title">
                    <span>👥 People Nearby</span>
                    <Link to="/nearby">See all</Link>
                </div>

                {SUGGESTED_USERS.map((u, i) => (
                    <div
                        key={u.id}
                        className="user-row"
                        style={{
                            animationDelay: `${i * 60}ms`,
                        }}
                    >
                        <InitialsAvatar name={u.name} size={38} />
                        <div className="user-row-info">
                            <p className="user-row-name">{u.name}</p>
                            <p className="user-row-sub">📍 {u.location}</p>
                        </div>
                        <SmallFollowBtn />
                    </div>
                ))}
            </div>

            {/* ── 2. Trending Circles ───────────────────────────── */}
            <div
                className="widget animate-fade-in"
                style={{ animationDelay: "80ms" }}
            >
                <div className="widget-title">
                    <span>🔥 Trending Circles</span>
                    <Link to="/circles">See all</Link>
                </div>

                {TRENDING_CIRCLES.map((c) => (
                    <Link
                        key={c.name}
                        to={`/circles/${c.name.toLowerCase().replace(" ", "-")}`}
                        className="circle-chip"
                        style={{ textDecoration: "none" }}
                    >
                        <span className="circle-icon">{c.emoji}</span>
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
                                {c.members} members
                            </p>
                        </div>
                        {c.active && (
                            <span
                                className="pill pill-success"
                                style={{ fontSize: "0.68rem" }}
                            >
                                Active
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            {/* ── 3. Upcoming Events ────────────────────────────── */}
            <div
                className="widget animate-fade-in"
                style={{ animationDelay: "160ms" }}
            >
                <div className="widget-title">
                    <span>📅 Upcoming Events</span>
                    <Link to="/events">See all</Link>
                </div>

                {UPCOMING_EVENTS.map((ev) => (
                    <div
                        key={ev.id}
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
                            (e.currentTarget.style.background = "transparent")
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
                            {ev.emoji}
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                    lineHeight: 1.3,
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
                                {ev.date} · {ev.attendees} going
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Footer ────────────────────────────────────────── */}
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
};

export default RightSidebar;
