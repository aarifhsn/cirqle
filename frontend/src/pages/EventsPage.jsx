/* EventsPage.jsx — Cirqle
 * Fetches GET /events
 * POST /events/:id/rsvp  — toggle RSVP
 * POST /events           — create event
 */

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

/* ── Mock data ────────────────────────────────────────────────── */
const MOCK_EVENTS = [
    {
        id: 1,
        title: "Tech Meetup Dhaka",
        description:
            "Monthly gathering for developers and tech enthusiasts in Dhaka.",
        location: "Banani, Dhaka",
        start_date: "2025-06-14T18:00:00",
        category: "Tech",
        attendees_count: 42,
        is_attending: false,
        cover_image: null,
    },
    {
        id: 2,
        title: "Photography Walk",
        description: "Explore Old Dhaka with your camera. All levels welcome!",
        location: "Old Dhaka",
        start_date: "2025-06-15T08:00:00",
        category: "Art",
        attendees_count: 18,
        is_attending: true,
        cover_image: null,
    },
    {
        id: 3,
        title: "Startup Pitch Night",
        description: "Pitch your startup idea to investors and get feedback.",
        location: "Gulshan, Dhaka",
        start_date: "2025-06-20T19:00:00",
        category: "Business",
        attendees_count: 65,
        is_attending: false,
        cover_image: null,
    },
    {
        id: 4,
        title: "Community Clean-up",
        description: "Join us to keep our neighborhood clean and green.",
        location: "Mirpur, Dhaka",
        start_date: "2025-06-21T07:00:00",
        category: "Community",
        attendees_count: 31,
        is_attending: false,
        cover_image: null,
    },
    {
        id: 5,
        title: "Food Festival",
        description: "Taste dishes from all over Bangladesh in one place.",
        location: "Dhanmondi, Dhaka",
        start_date: "2025-06-28T12:00:00",
        category: "Food",
        attendees_count: 120,
        is_attending: false,
        cover_image: null,
    },
    {
        id: 6,
        title: "Fitness Bootcamp",
        description: "Free outdoor bootcamp session for all fitness levels.",
        location: "Suhrawardy Udyan",
        start_date: "2025-07-05T06:30:00",
        category: "Health",
        attendees_count: 27,
        is_attending: false,
        cover_image: null,
    },
];

const CATEGORIES = [
    "All",
    "Tech",
    "Art",
    "Business",
    "Community",
    "Food",
    "Health",
    "Education",
    "Music",
];

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en", {
        hour: "2-digit",
        minute: "2-digit",
    });
const fmtMonth = (d) =>
    new Date(d).toLocaleString("en", { month: "short" }).toUpperCase();
const fmtDay = (d) => new Date(d).getDate();

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem 1.4rem" }}>
                <div className="flex gap-3">
                    <div
                        className="skeleton flex-shrink-0"
                        style={{ width: 52, height: 58, borderRadius: 10 }}
                    />
                    <div className="flex-1">
                        <div
                            className="skeleton mb-2"
                            style={{
                                height: 16,
                                width: "55%",
                                borderRadius: 6,
                            }}
                        />
                        <div
                            className="skeleton mb-2"
                            style={{
                                height: 12,
                                width: "35%",
                                borderRadius: 6,
                            }}
                        />
                        <div
                            className="skeleton"
                            style={{
                                height: 12,
                                width: "45%",
                                borderRadius: 6,
                            }}
                        />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/* ── Event Card ───────────────────────────────────────────────── */
const EventCard = ({ event: initial }) => {
    const [event, setEvent] = useState(initial);
    const [loading, setLoading] = useState(false);
    const { api } = useAxios();

    const handleRsvp = async () => {
        setLoading(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events/${event.id}/rsvp`,
            );
            setEvent((e) => ({
                ...e,
                is_attending: res.data.is_attending,
                attendees_count:
                    res.data.attendees_count ??
                    (e.is_attending
                        ? e.attendees_count - 1
                        : e.attendees_count + 1),
            }));
            toast.success(
                res.data.message ??
                    (event.is_attending ? "Cancelled RSVP" : "You're going!"),
            );
        } catch {
            setEvent((e) => ({
                ...e,
                is_attending: !e.is_attending,
                attendees_count: e.is_attending
                    ? e.attendees_count - 1
                    : e.attendees_count + 1,
            }));
            toast.success(
                event.is_attending ? "Cancelled RSVP" : "You're going! 🎉",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="card card-hover animate-fade-in"
            style={{ padding: "1.25rem 1.4rem" }}
        >
            <div className="flex items-start gap-4">
                {/* Date block */}
                <div
                    className="flex-center flex-col flex-shrink-0"
                    style={{
                        width: 52,
                        height: 58,
                        borderRadius: 12,
                        background: event.is_attending
                            ? "var(--accent)"
                            : "var(--accent-soft)",
                        border: `1px solid ${event.is_attending ? "var(--accent)" : "var(--border)"}`,
                    }}
                >
                    <span
                        style={{
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            color: event.is_attending
                                ? "rgba(255,255,255,0.8)"
                                : "var(--accent)",
                            letterSpacing: "0.08em",
                        }}
                    >
                        {fmtMonth(event.start_date)}
                    </span>
                    <span
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: event.is_attending
                                ? "#fff"
                                : "var(--accent)",
                            lineHeight: 1,
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        {fmtDay(event.start_date)}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4
                            className="font-bold mb-1"
                            style={{
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                                fontSize: "1rem",
                            }}
                        >
                            {event.title}
                        </h4>
                        <span
                            className="pill pill-muted flex-shrink-0"
                            style={{ fontSize: "0.68rem" }}
                        >
                            {event.category}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                        <p
                            className="text-xs flex items-center gap-1"
                            style={{ color: "var(--text-muted)" }}
                        >
                            📍 {event.location}
                        </p>
                        <p
                            className="text-xs flex items-center gap-1"
                            style={{ color: "var(--text-muted)" }}
                        >
                            🕐 {fmtDate(event.start_date)} ·{" "}
                            {fmtTime(event.start_date)}
                        </p>
                    </div>

                    {event.description && (
                        <p
                            className="text-sm leading-relaxed mb-3"
                            style={{
                                color: "var(--text-secondary)",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {event.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between">
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {event.is_attending
                                ? `✅ You + ${event.attendees_count - 1} others going`
                                : `${event.attendees_count} going`}
                        </span>
                        <button
                            onClick={handleRsvp}
                            disabled={loading}
                            className={`btn btn-sm ${event.is_attending ? "btn-ghost" : "btn-primary"}`}
                            style={
                                event.is_attending
                                    ? {
                                          color: "var(--danger)",
                                          borderColor: "var(--danger)",
                                      }
                                    : {}
                            }
                        >
                            {loading
                                ? "…"
                                : event.is_attending
                                  ? "Cancel RSVP"
                                  : "RSVP"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Create Event Modal ───────────────────────────────────────── */
const CreateEventModal = ({ onClose, onCreated }) => {
    const { api } = useAxios();
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        start_date: "",
        category: "Tech",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events`,
                form,
            );
            toast.success("Event created!");
            onCreated(res.data?.data ?? res.data);
        } catch {
            toast.error("Failed to create event.");
        } finally {
            setSaving(false);
        }
    };

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "var(--bg-overlay)" }}
        >
            <div
                className="card w-full max-w-md animate-fade-in-scale"
                style={{
                    padding: "1.75rem",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
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
                        📅 Create Event
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {[
                        {
                            label: "Title",
                            key: "title",
                            type: "text",
                            placeholder: "Event name",
                        },
                        {
                            label: "Location",
                            key: "location",
                            type: "text",
                            placeholder: "Where is it?",
                        },
                        {
                            label: "Date & Time",
                            key: "start_date",
                            type: "datetime-local",
                            placeholder: "",
                        },
                    ].map((f) => (
                        <div key={f.key} className="mb-3">
                            <label
                                className="block text-xs font-semibold mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {f.label}
                            </label>
                            <input
                                required
                                type={f.type}
                                className="input"
                                placeholder={f.placeholder}
                                value={form[f.key]}
                                onChange={(e) => set(f.key, e.target.value)}
                            />
                        </div>
                    ))}

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
                            onChange={(e) => set("category", e.target.value)}
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
                            placeholder="Tell people about your event…"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
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
                            {saving ? "Creating…" : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── EventsPage ───────────────────────────────────────────────── */
const EventsPage = () => {
    const { api } = useAxios();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("All");
    const [filter, setFilter] = useState("upcoming"); // upcoming | attending
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/events`)
            .then((r) => setEvents(r.data?.data ?? r.data ?? []))
            .catch(() => setEvents(MOCK_EVENTS))
            .finally(() => setLoading(false));
    }, []);

    const filtered = events.filter((e) => {
        const matchCat = category === "All" || e.category === category;
        const matchFilter = filter === "attending" ? e.is_attending : true;
        const matchSearch =
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.location.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchFilter && matchSearch;
    });

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
                        📅 Events
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Upcoming events near you
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn btn-primary btn-sm"
                >
                    + Create Event
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
                    placeholder="Search events…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setFilter("upcoming")}
                    className="btn btn-sm btn-round"
                    style={
                        filter === "upcoming"
                            ? { background: "var(--accent)", color: "#fff" }
                            : {
                                  background: "var(--bg-surface-2)",
                                  color: "var(--text-muted)",
                                  border: "1px solid var(--border)",
                              }
                    }
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setFilter("attending")}
                    className="btn btn-sm btn-round"
                    style={
                        filter === "attending"
                            ? { background: "var(--accent)", color: "#fff" }
                            : {
                                  background: "var(--bg-surface-2)",
                                  color: "var(--text-muted)",
                                  border: "1px solid var(--border)",
                              }
                    }
                >
                    Going
                </button>
                <div
                    style={{
                        width: 1,
                        height: 20,
                        background: "var(--border)",
                        margin: "0 4px",
                    }}
                />
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="btn btn-sm btn-round"
                        style={
                            category === cat
                                ? {
                                      background: "var(--accent-soft)",
                                      color: "var(--accent)",
                                      border: "1px solid var(--accent)",
                                  }
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

            {/* Count */}
            {!loading && filtered.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {filtered.length} events
                </p>
            )}

            {loading && <Skeleton />}

            {!loading && filtered.length === 0 && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
                >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                        📅
                    </span>
                    <h3
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        No events found
                    </h3>
                    <p
                        className="text-sm mb-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Be the first to create one!
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="btn btn-primary btn-sm"
                    >
                        Create Event
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                    {filtered.map((e) => (
                        <EventCard key={e.id} event={e} />
                    ))}
                </div>
            )}

            {showCreate && (
                <CreateEventModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(e) => {
                        setEvents((prev) => [e, ...prev]);
                        setShowCreate(false);
                    }}
                />
            )}
        </AppLayout>
    );
};

export default EventsPage;
