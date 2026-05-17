import { useState } from "react";
import { toast } from "react-toastify";
import useAxios from "../../hooks/useAxios";

const PollWidget = ({ options = [], postId, votes = {}, userVote = null }) => {
    const { api } = useAxios();

    const normalise = (opts) =>
        opts.map((o, i) =>
            typeof o === "string"
                ? {
                      id: i,
                      text: o,
                      votes_count: votes[i] ?? 0,
                      has_voted: userVote === i,
                  }
                : { ...o, id: i },
        );

    const [opts, setOpts] = useState(normalise(options));
    const [voting, setVoting] = useState(false);
    const totalVotes = opts.reduce((s, o) => s + (o.votes_count ?? 0), 0);
    const hasVoted = opts.some((o) => o.has_voted);

    const handleVote = async (optionIndex) => {
        if (hasVoted || voting) return;
        setVoting(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${postId}/poll/vote`,
                { option_index: optionIndex },
            );
            setOpts((prev) =>
                prev.map((o, i) => ({
                    ...o,
                    votes_count: res.data.votes?.[i] ?? o.votes_count,
                    has_voted: i === optionIndex,
                })),
            );
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to vote.");
        } finally {
            setVoting(false);
        }
    };

    const newTotal = hasVoted ? totalVotes + 1 : totalVotes;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: "0.75rem",
            }}
        >
            {opts.map((opt, i) => {
                const votes = opt.has_voted
                    ? (opt.votes_count ?? 0) + 1
                    : (opt.votes_count ?? 0);
                const pct =
                    newTotal > 0 ? Math.round((votes / newTotal) * 100) : 0;
                const isChosen = opt.has_voted;

                return (
                    <button
                        key={i}
                        onClick={() => handleVote(i)}
                        disabled={hasVoted || voting}
                        style={{
                            position: "relative",
                            width: "100%",
                            textAlign: "left",
                            border: `1.5px solid ${isChosen ? "var(--accent)" : "var(--border)"}`,
                            background: isChosen
                                ? "var(--accent-soft)"
                                : "var(--bg-surface-2)",
                            borderRadius: 10,
                            padding: "0.6rem 0.875rem",
                            cursor: hasVoted ? "default" : "pointer",
                            overflow: "hidden",
                            transition: "border-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            if (!hasVoted)
                                e.currentTarget.style.borderColor =
                                    "var(--accent)";
                        }}
                        onMouseLeave={(e) => {
                            if (!isChosen)
                                e.currentTarget.style.borderColor =
                                    "var(--border)";
                        }}
                    >
                        {/* Progress bar */}
                        {hasVoted && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    height: "100%",
                                    width: `${pct}%`,
                                    background: isChosen
                                        ? "var(--accent-soft)"
                                        : "var(--bg-surface-3, var(--bg-surface-2))",
                                    borderRadius: 10,
                                    transition:
                                        "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                                    zIndex: 0,
                                }}
                            />
                        )}

                        {/* Label row */}
                        <div
                            style={{
                                position: "relative",
                                zIndex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 500,
                                    color: isChosen
                                        ? "var(--accent)"
                                        : "var(--text-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                {isChosen && (
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                )}
                                {opt.text}
                            </span>
                            {hasVoted && (
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        color: isChosen
                                            ? "var(--accent)"
                                            : "var(--text-muted)",
                                        flexShrink: 0,
                                    }}
                                >
                                    {pct}%
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}

            <p
                style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                }}
            >
                {newTotal} {newTotal === 1 ? "vote" : "votes"}
                {!hasVoted && " · tap to vote"}
            </p>
        </div>
    );
};

const PostBody = ({
    poster,
    images = [],
    content,
    type,
    pollOptions = [],
    postId,
    votes = {},
    userVote = null,
}) => {
    const [lightbox, setLightbox] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const allImages =
        images.length > 0
            ? images.map(
                  (img) => `${import.meta.env.VITE_STORAGE_URL}/${img.image}`,
              )
            : poster
              ? [`${import.meta.env.VITE_STORAGE_URL}/${poster}`]
              : [];

    /* ── Original lightbox logic untouched ───────────────────── */
    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightbox(allImages[index]);
    };

    const prev = (e) => {
        e.stopPropagation();
        const i = (lightboxIndex - 1 + allImages.length) % allImages.length;
        setLightboxIndex(i);
        setLightbox(allImages[i]);
    };

    const next = (e) => {
        e.stopPropagation();
        const i = (lightboxIndex + 1) % allImages.length;
        setLightboxIndex(i);
        setLightbox(allImages[i]);
    };

    const gridClass =
        allImages.length === 1
            ? "grid-cols-1"
            : allImages.length === 2
              ? "grid-cols-2"
              : "grid-cols-3";

    return (
        <div className="mb-1">
            {/* Content */}
            {content && (
                <p
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-3"
                    style={{ color: "var(--text-primary)" }}
                >
                    {content}
                </p>
            )}

            {/* Poll UI */}
            {type === "poll" && pollOptions?.length > 0 && (
                <PollWidget
                    options={pollOptions}
                    postId={postId}
                    votes={votes} // ← add
                    userVote={userVote}
                />
            )}

            {/* ── Image grid ────────────────────────────────────── */}
            {allImages.length > 0 && (
                <div className={`grid gap-1.5 ${gridClass} mb-1`}>
                    {allImages.slice(0, 3).map((src, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden cursor-pointer group"
                            style={{
                                aspectRatio:
                                    allImages.length === 1 ? "16/9" : "1",
                                borderRadius: 12,
                            }}
                            onClick={() => openLightbox(i)}
                        >
                            <img
                                src={src}
                                alt={`post image ${i + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 rounded-xl" />

                            {/* +N overlay when more than 3 */}
                            {allImages.length > 3 && i === 2 && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold font-display"
                                    style={{ background: "rgba(0,0,0,0.55)" }}
                                >
                                    +{allImages.length - 3}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Lightbox (logic untouched, style updated) ─────── */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.92)" }}
                    onClick={() => setLightbox(null)}
                >
                    {allImages.length > 1 && (
                        <button
                            onClick={prev}
                            className="absolute left-4 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition-all z-10"
                            style={{ background: "rgba(255,255,255,0.15)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.25)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.15)")
                            }
                        >
                            ‹
                        </button>
                    )}

                    <img
                        src={lightbox}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                        alt="lightbox"
                    />

                    {allImages.length > 1 && (
                        <button
                            onClick={next}
                            className="absolute right-4 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition-all z-10"
                            style={{ background: "rgba(255,255,255,0.15)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.25)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(255,255,255,0.15)")
                            }
                        >
                            ›
                        </button>
                    )}

                    {allImages.length > 1 && (
                        <span
                            className="absolute bottom-5 text-white text-sm px-3 py-1 rounded-full"
                            style={{ background: "rgba(0,0,0,0.5)" }}
                        >
                            {lightboxIndex + 1} / {allImages.length}
                        </span>
                    )}

                    <button
                        className="absolute top-4 right-4 text-white text-lg rounded-full w-9 h-9 flex items-center justify-center transition-all"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                                "rgba(255,255,255,0.25)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                                "rgba(255,255,255,0.15)")
                        }
                        onClick={() => setLightbox(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostBody;
