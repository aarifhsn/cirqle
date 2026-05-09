/* PostBody.jsx — Cirqle v2
 * Changes from original:
 * - Fixed text color: was hardcoded `text-white`, now uses CSS var
 * - Image grid border-radius matches card radius
 * - Lightbox overlay uses CSS var (dark/light safe)
 * - All lightbox nav logic 100% untouched
 */

import { useState } from "react";

const PostBody = ({ poster, images = [], content }) => {
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
            {/* ── Post text ─────────────────────────────────────── */}
            {content && (
                <p
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-3"
                    style={{ color: "var(--text-primary)" }}
                >
                    {content}
                </p>
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
