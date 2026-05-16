import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

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

const fmtMonth = (d) =>
    new Date(d).toLocaleString("en", { month: "short" }).toUpperCase();
const fmtDay = (d) => new Date(d).getDate();
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

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem 1.4rem" }}>
                <div className="flex gap-4">
                    <div
                        className="skeleton flex-shrink-0"
                        style={{ width: 52, height: 58, borderRadius: 12 }}
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

/* ── Three-dot Menu ───────────────────────────────────────────── */
const ThreeDotMenu = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="btn btn-ghost btn-icon"
                style={{ color: "var(--text-muted)", padding: "0.25rem" }}
            >
                {/* Vertical three dots */}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                >
                    <circle cx="8" cy="3" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="8" cy="13" r="1.5" />
                </svg>
            </button>

            {open && (
                <div
                    className="card animate-fade-in"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 4px)",
                        zIndex: 50,
                        minWidth: 130,
                        padding: "0.35rem",
                        boxShadow: "var(--shadow-lg)",
                    }}
                >
                    <button
                        onClick={() => {
                            setOpen(false);
                            onEdit();
                        }}
                        className="btn btn-ghost btn-sm w-full text-left"
                        style={{ justifyContent: "flex-start", gap: "0.5rem" }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            onDelete();
                        }}
                        className="btn btn-ghost btn-sm w-full text-left"
                        style={{
                            justifyContent: "flex-start",
                            gap: "0.5rem",
                            color: "var(--danger)",
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
        </div>
    );
};

/* ── Edit Event Modal ─────────────────────────────────────────── */
const EditEventModal = ({ event, onClose, onUpdated }) => {
    const { api } = useAxios();
    const [form, setForm] = useState({
        title: event.title ?? "",
        description: event.description ?? "",
        location: event.location ?? "",
        start_date: event.start_date
            ? new Date(event.start_date).toISOString().slice(0, 16)
            : "",
        category: event.category ?? "Tech",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events/${event.id}`,
                form,
            );
            toast.success("Event updated!");
            onUpdated(res.data?.data ?? res.data);
        } catch (err) {
            setError(err.response?.data?.message ?? "Failed to update event.");
        } finally {
            setSaving(false);
        }
    };

    // Same layout as CreateEventModal — only title and submit label differ
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
                        ✏️ Edit Event
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
                    {[
                        {
                            label: "Title",
                            key: "title",
                            type: "text",
                            placeholder: "Event name",
                            required: true,
                        },
                        {
                            label: "Location",
                            key: "location",
                            type: "text",
                            placeholder: "Where?",
                            required: false,
                        },
                        {
                            label: "Date & Time",
                            key: "start_date",
                            type: "datetime-local",
                            placeholder: "",
                            required: true,
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
                                type={f.type}
                                className="input"
                                placeholder={f.placeholder}
                                required={f.required}
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
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── Event Card ───────────────────────────────────────────────── */
const EventCard = ({ event: initial, currentUserId, onDeleted }) => {
    const [event, setEvent] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const { api } = useAxios();

    const isOwner = Number(event.user_id) === Number(currentUserId);

    const handleRsvp = async () => {
        setLoading(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events/${event.id}/rsvp`,
            );
            if (res.status === 200) {
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
                        (event.is_attending
                            ? "RSVP cancelled"
                            : "You're going! 🎉"),
                );
            }
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to update RSVP.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await api.delete(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events/${event.id}`,
            );
            toast.success("Event deleted.");
            onDeleted(event.id);
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to delete event.");
        }
    };

    return (
        <>
            <div
                className="card card-hover animate-fade-in"
                style={{ padding: "1.25rem 1.4rem" }}
            >
                <div className="flex items-start gap-4">
                    {/* Date block — unchanged */}
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
                                letterSpacing: "0.08em",
                                color: event.is_attending
                                    ? "rgba(255,255,255,0.8)"
                                    : "var(--accent)",
                            }}
                        >
                            {fmtMonth(event.start_date)}
                        </span>
                        <span
                            style={{
                                fontSize: "1.4rem",
                                fontWeight: 800,
                                lineHeight: 1,
                                fontFamily: "var(--font-display)",
                                color: event.is_attending
                                    ? "#fff"
                                    : "var(--accent)",
                            }}
                        >
                            {fmtDay(event.start_date)}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                                className="font-bold"
                                style={{
                                    color: "var(--text-primary)",
                                    fontFamily: "var(--font-display)",
                                    fontSize: "1rem",
                                }}
                            >
                                {event.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {event.category && (
                                    <span
                                        className="pill pill-muted"
                                        style={{ fontSize: "0.68rem" }}
                                    >
                                        {event.category}
                                    </span>
                                )}
                                {/* Three-dot menu — only for owner */}
                                {isOwner && (
                                    <ThreeDotMenu
                                        onEdit={() => setShowEdit(true)}
                                        onDelete={handleDelete}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Rest of card body — unchanged from your original */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                            {event.location && (
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    📍 {event.location}
                                </p>
                            )}
                            {event.start_date && (
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    🕐 {fmtDate(event.start_date)} ·{" "}
                                    {fmtTime(event.start_date)}
                                </p>
                            )}
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

                        <div
                            className="flex items-center justify-between pt-2"
                            style={{ borderTop: "1px solid var(--border)" }}
                        >
                            <span
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {event.is_attending
                                    ? `✅ You + ${Math.max(0, (event.attendees_count ?? 1) - 1)} others going`
                                    : `${event.attendees_count ?? 0} going`}
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

            {showEdit && (
                <EditEventModal
                    event={event}
                    onClose={() => setShowEdit(false)}
                    onUpdated={(updated) => {
                        setEvent(updated);
                        setShowEdit(false);
                    }}
                />
            )}
        </>
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
    const [error, setError] = useState(null);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events`,
                form,
            );
            toast.success("Event created!");
            onCreated(res.data?.data ?? res.data);
        } catch (e) {
            setError(e.response?.data?.message ?? "Failed to create event.");
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
                    {[
                        {
                            label: "Title",
                            key: "title",
                            type: "text",
                            placeholder: "Event name",
                            required: true,
                        },
                        {
                            label: "Location",
                            key: "location",
                            type: "text",
                            placeholder: "Where?",
                            required: false,
                        },
                        {
                            label: "Date & Time",
                            key: "start_date",
                            type: "datetime-local",
                            placeholder: "",
                            required: true,
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
                                type={f.type}
                                className="input"
                                placeholder={f.placeholder}
                                required={f.required}
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
    const [error, setError] = useState(null);
    const [category, setCategory] = useState("All");
    const [filter, setFilter] = useState("upcoming"); // upcoming | attending
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [searchParams] = useSearchParams();
    useEffect(() => {
        if (searchParams.get("create") === "true") setShowCreate(true);
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/events`,
            );
            setEvents(res.data?.data ?? res.data ?? []);
        } catch (e) {
            setError(e.response?.data?.message ?? "Failed to load events.");
        } finally {
            setLoading(false);
        }
    };

    const { auth } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, []);

    const filtered = events.filter((e) => {
        const matchCat = category === "All" || e.category === category;
        const matchFilter = filter === "attending" ? e.is_attending : true;
        const matchSearch = `${e.title} ${e.location ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchCat && matchFilter && matchSearch;
    });

    // inside EventsPage, add a handler:
    const handleDeleted = (id) =>
        setEvents((prev) => prev.filter((e) => e.id !== id));

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

            {/* Filter row */}
            <div className="flex items-center gap-2 flex-wrap">
                {["upcoming", "attending"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="btn btn-sm btn-round"
                        style={
                            filter === f
                                ? { background: "var(--accent)", color: "#fff" }
                                : {
                                      background: "var(--bg-surface-2)",
                                      color: "var(--text-muted)",
                                      border: "1px solid var(--border)",
                                  }
                        }
                    >
                        {f === "upcoming" ? "Upcoming" : "Going"}
                    </button>
                ))}

                <div
                    style={{
                        width: 1,
                        height: 20,
                        background: "var(--border)",
                        margin: "0 2px",
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

            {/* Error */}
            {error && <ErrorBanner message={error} onRetry={fetchEvents} />}

            {/* Count */}
            {!loading && !error && filtered.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "event" : "events"}
                </p>
            )}

            {/* Skeleton */}
            {loading && <Skeleton />}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
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
                        {filter === "attending"
                            ? "You haven't RSVPed to any events yet."
                            : "Be the first to create one!"}
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="btn btn-primary btn-sm"
                    >
                        Create Event
                    </button>
                </div>
            )}

            {/* List */}
            {!loading && !error && filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                    {filtered.map((e) => (
                        <EventCard
                            key={e.id}
                            event={e}
                            currentUserId={auth?.user?.id}
                            onDeleted={handleDeleted}
                        />
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
