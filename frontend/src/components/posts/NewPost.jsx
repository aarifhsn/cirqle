/* NewPost.jsx — Cirqle v2
 * Each composer action opens its own dedicated modal:
 * Photo → PostEntry (existing)
 * Poll  → PollModal (new inline)
 * Mood  → MoodModal (new inline)
 * Job   → navigate("/jobs?create=true")
 * Event → navigate("/events?create=true")
 * Sell  → navigate("/marketplace?create=true")
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { usePost } from "../../hooks/usePost";
import Avatar from "../common/Avatar";
import PostEntry from "./PostEntry";

const COMPOSER_ACTIONS = [
    { icon: "◫", label: "Photo", key: "photo" },
    { icon: "▤", label: "Poll", key: "poll" },
    { icon: "◌", label: "Mood", key: "mood" },
    { icon: "◧", label: "Job", key: "job" },
    { icon: "◷", label: "Event", key: "event" },
    { icon: "⌑", label: "Sell", key: "sell" },
];

/* ── Shared modal shell ───────────────────────────────────────── */
const ModalShell = ({ title, onClose, children }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "var(--bg-overlay)" }}
    >
        <div
            className="card w-full max-w-md animate-fade-in-scale"
            style={{ padding: "1.75rem", maxHeight: "90vh", overflowY: "auto" }}
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
                    {title}
                </h2>
                <button onClick={onClose} className="btn btn-ghost btn-icon">
                    ✕
                </button>
            </div>
            {children}
        </div>
    </div>
);

/* ── Shared form footer ───────────────────────────────────────── */
const ModalFooter = ({ onClose, saving, label }) => (
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
            {saving ? (
                <span className="flex items-center justify-center gap-2">
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
                    Saving…
                </span>
            ) : (
                label
            )}
        </button>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   POLL MODAL
   ══════════════════════════════════════════════════════════════ */
const PollModal = ({ onClose }) => {
    const { api } = useAxios();
    const { dispatch } = usePost();
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [duration, setDuration] = useState("1");
    const [saving, setSaving] = useState(false);

    const addOption = () => {
        if (options.length < 4) setOptions((o) => [...o, ""]);
    };
    const removeOption = (i) => {
        if (options.length > 2)
            setOptions((o) => o.filter((_, idx) => idx !== i));
    };
    const updateOption = (i, v) =>
        setOptions((o) => o.map((opt, idx) => (idx === i ? v : opt)));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filled = options.filter((o) => o.trim());
        if (filled.length < 2) {
            toast.error("Add at least 2 options.");
            return;
        }
        setSaving(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts`,
                {
                    content: question,
                    type: "poll",
                    poll_options: filled,
                    poll_duration: parseInt(duration),
                    privacy: "public",
                },
            );
            if (res.status === 200 || res.status === 201) {
                dispatch({ type: actions.post.DATA_CREATED, data: res.data });
                toast.success("Poll created!");
                onClose();
            }
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to create poll.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell title="📊 Create Poll" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                {/* Question */}
                <div className="mb-4">
                    <label
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Question
                    </label>
                    <input
                        required
                        className="input"
                        placeholder="Ask a question…"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </div>

                {/* Options */}
                <div className="mb-4">
                    <label
                        className="block text-xs font-semibold mb-2"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Options
                    </label>
                    <div className="flex flex-col gap-2">
                        {options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span
                                    className="text-sm font-semibold flex-shrink-0 w-5 text-center"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {i + 1}
                                </span>
                                <input
                                    className="input flex-1"
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={(e) =>
                                        updateOption(i, e.target.value)
                                    }
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(i)}
                                        className="flex-shrink-0 text-sm transition-colors"
                                        style={{ color: "var(--danger)" }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {options.length < 4 && (
                        <button
                            type="button"
                            onClick={addOption}
                            className="mt-2 text-xs font-medium flex items-center gap-1"
                            style={{ color: "var(--accent)" }}
                        >
                            + Add option
                        </button>
                    )}
                </div>

                {/* Duration */}
                <div className="mb-5">
                    <label
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Poll duration
                    </label>
                    <select
                        className="input"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    >
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                    </select>
                </div>

                <ModalFooter
                    onClose={onClose}
                    saving={saving}
                    label="Create Poll"
                />
            </form>
        </ModalShell>
    );
};

/* ══════════════════════════════════════════════════════════════
   MOOD MODAL
   ══════════════════════════════════════════════════════════════ */
const MOODS = [
    { emoji: "☕", label: "Working", color: "#6C63FF" },
    { emoji: "📚", label: "Studying", color: "#3B82F6" },
    { emoji: "✈️", label: "Traveling", color: "#43CFAA" },
    { emoji: "💼", label: "Available for work", color: "#22C55E" },
    { emoji: "🎮", label: "Gaming", color: "#EC4899" },
    { emoji: "🍜", label: "Eating", color: "#F59E0B" },
    { emoji: "🏋️", label: "Working out", color: "#EF4444" },
    { emoji: "😴", label: "Resting", color: "#8B5CF6" },
    { emoji: "🎵", label: "Listening to music", color: "#06B6D4" },
    { emoji: "🤒", label: "Not feeling well", color: "#F97316" },
    { emoji: "🥳", label: "Celebrating", color: "#EC4899" },
    { emoji: "🤔", label: "Thinking", color: "#6B7280" },
];

const MoodModal = ({ onClose, user }) => {
    const { api } = useAxios();
    const { dispatch } = usePost();
    const [selected, setSelected] = useState(null);
    const [caption, setCaption] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selected) {
            toast.error("Pick a mood first.");
            return;
        }
        setSaving(true);

        const moodLine = `${selected.emoji} ${user?.firstName ?? "I"} is ${selected.label.toLowerCase()}`;
        const content = caption ? `${moodLine}\n\n${caption}` : moodLine;

        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts`,
                {
                    content,
                    type: "mood",
                    privacy: "public",
                },
            );
            if (res.status === 200 || res.status === 201) {
                dispatch({ type: actions.post.DATA_CREATED, data: res.data });
                toast.success("Mood shared!");
                onClose();
            }
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to share mood.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell title="😊 What's your Mood?" onClose={onClose}>
            <form onSubmit={handleSubmit}>
                {/* Mood grid */}
                <div className="mb-4">
                    <label
                        className="block text-xs font-semibold mb-2"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        How are you feeling?
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {MOODS.map((mood) => {
                            const isActive = selected?.label === mood.label;
                            return (
                                <button
                                    key={mood.label}
                                    type="button"
                                    onClick={() => setSelected(mood)}
                                    className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                                    style={{
                                        border: `2px solid ${isActive ? mood.color : "var(--border)"}`,
                                        background: isActive
                                            ? `${mood.color}18`
                                            : "var(--bg-surface-2)",
                                    }}
                                >
                                    <span style={{ fontSize: "1.4rem" }}>
                                        {mood.emoji}
                                    </span>
                                    <span
                                        className="text-xs font-medium leading-tight text-center"
                                        style={{
                                            color: isActive
                                                ? mood.color
                                                : "var(--text-secondary)",
                                        }}
                                    >
                                        {mood.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Preview */}
                {selected && (
                    <div
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 animate-fade-in"
                        style={{
                            background: `${selected.color}15`,
                            border: `1px solid ${selected.color}40`,
                        }}
                    >
                        <span style={{ fontSize: "1.2rem" }}>
                            {selected.emoji}
                        </span>
                        <p
                            className="text-sm font-medium"
                            style={{ color: selected.color }}
                        >
                            {user?.firstName ?? "You"} is{" "}
                            {selected.label.toLowerCase()}
                        </p>
                    </div>
                )}

                {/* Caption */}
                <div className="mb-5">
                    <label
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Add a note (optional)
                    </label>
                    <textarea
                        className="input"
                        rows={2}
                        style={{ resize: "none" }}
                        placeholder="What's going on?"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                </div>

                <ModalFooter
                    onClose={onClose}
                    saving={saving}
                    label="Share Mood"
                />
            </form>
        </ModalShell>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN NEWPOST COMPONENT
   ══════════════════════════════════════════════════════════════ */
const NewPost = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [activeModal, setActiveModal] = useState(null);
    // null | "photo" | "poll" | "mood"

    const handleAction = (key) => {
        switch (key) {
            case "photo":
                setActiveModal("photo");
                break;
            case "poll":
                setActiveModal("poll");
                break;
            case "mood":
                setActiveModal("mood");
                break;
            /* Job / Event / Sell — navigate to their pages with ?create=true
               Those pages read this param and auto-open their create modal */
            case "job":
                navigate("/jobs?create=true");
                break;
            case "event":
                navigate("/events?create=true");
                break;
            case "sell":
                navigate("/marketplace?create=true");
                break;
            default:
                setActiveModal("photo");
        }
    };

    const closeModal = () => setActiveModal(null);

    return (
        <>
            {/* ── Composer Card ─────────────────────────────────── */}
            <div
                className="card animate-fade-in"
                style={{ padding: "1rem 1.25rem" }}
            >
                {/* Avatar + prompt */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                        <Avatar user={auth?.user} size="md" />
                        <span className="online-dot" />
                    </div>

                    <button
                        onClick={() => setActiveModal("photo")}
                        className="flex-1 text-left px-4 py-2.5 rounded-full text-sm transition-all"
                        style={{
                            background: "var(--input-bg)",
                            border: "1.5px solid var(--border)",
                            color: "var(--text-muted)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.background =
                                "var(--input-bg-focus)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.background =
                                "var(--input-bg)";
                        }}
                    >
                        What's on your mind, {auth?.user?.firstName}?
                    </button>
                </div>

                <div className="divider" />

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-wrap">
                    {COMPOSER_ACTIONS.map((action) => (
                        <button
                            key={action.key}
                            onClick={() => handleAction(action.key)}
                            className="compose-action flex-1"
                            style={{ minWidth: "fit-content" }}
                            title={action.label}
                        >
                            <span style={{ fontSize: "1rem" }}>
                                {action.icon}
                            </span>
                            <span className="hidden sm:inline text-xs font-medium">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Photo / Post modal ────────────────────────────── */}
            {activeModal === "photo" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "var(--bg-overlay)" }}
                >
                    <div className="w-full max-w-xl animate-fade-in-scale">
                        <PostEntry onCreate={closeModal} onClose={closeModal} />
                    </div>
                </div>
            )}

            {/* ── Poll modal ────────────────────────────────────── */}
            {activeModal === "poll" && <PollModal onClose={closeModal} />}

            {/* ── Mood modal ────────────────────────────────────── */}
            {activeModal === "mood" && (
                <MoodModal onClose={closeModal} user={auth?.user} />
            )}
        </>
    );
};

export default NewPost;
