/* PhotosTab.jsx — Cirqle v2
 * Changes from original:
 * - `bg-lighterDark animate-pulse` → `skeleton` class (uses CSS var shimmer)
 * - `text-lwsGreen`, `bg-lwsGreen/10` → CSS vars
 * - `border-[#3F3F3F]` → `var(--border)`
 * - Lightbox overlay uses CSS vars
 * - Photo grid hover uses scale-105 (kept)
 * - All API / lightbox nav logic 100% untouched
 */

import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";

const PhotosTab = ({ userId }) => {
    const { api } = useAxios();
    const [photos, setPhotos] = useState([]);
    const [lightbox, setLightbox] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    /* ── Original fetch logic untouched ──────────────────────── */
    useEffect(() => {
        setLoading(true);
        api.get(
            `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${userId}/photos`,
        )
            .then((r) => {
                setPhotos(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [userId]);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightbox(
            `${import.meta.env.VITE_STORAGE_URL}/${photos[index].image}`,
        );
    };

    const prev = (e) => {
        e.stopPropagation();
        const i = (lightboxIndex - 1 + photos.length) % photos.length;
        setLightboxIndex(i);
        setLightbox(`${import.meta.env.VITE_STORAGE_URL}/${photos[i].image}`);
    };

    const next = (e) => {
        e.stopPropagation();
        const i = (lightboxIndex + 1) % photos.length;
        setLightboxIndex(i);
        setLightbox(`${import.meta.env.VITE_STORAGE_URL}/${photos[i].image}`);
    };

    /* ── Loading skeleton ─────────────────────────────────────── */
    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-1.5 mt-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="skeleton aspect-square"
                        style={{ borderRadius: 12 }}
                    />
                ))}
            </div>
        );
    }

    /* ── Empty state ──────────────────────────────────────────── */
    if (photos.length === 0) {
        return (
            <div
                className="card flex-center flex-col mt-4"
                style={{ padding: "3.5rem 2rem", textAlign: "center" }}
            >
                <div
                    className="flex-center mb-3"
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "var(--accent-soft)",
                    }}
                >
                    <span style={{ fontSize: "1.4rem" }}>🖼️</span>
                </div>
                <p
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                >
                    No photos yet
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Photos from posts will appear here.
                </p>
            </div>
        );
    }

    /* ── Photo grid ───────────────────────────────────────────── */
    return (
        <>
            <div className="grid grid-cols-3 gap-1.5 mt-4">
                {photos.map((p, index) => (
                    <div
                        key={p.id}
                        onClick={() => openLightbox(index)}
                        className="aspect-square overflow-hidden cursor-pointer group"
                        style={{
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                        }}
                    >
                        <img
                            src={`${import.meta.env.VITE_STORAGE_URL}/${p.image}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 group-hover:opacity-90"
                            alt="photo"
                        />
                    </div>
                ))}
            </div>

            {/* ── Lightbox (logic untouched, styling updated) ───── */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6"
                    style={{ background: "rgba(0,0,0,0.92)" }}
                    onClick={() => setLightbox(null)}
                >
                    {photos.length > 1 && (
                        <button
                            onClick={prev}
                            className="absolute left-4 w-10 h-10 rounded-full text-white flex items-center justify-center text-xl transition-all z-10"
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
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        alt="full size"
                    />

                    {photos.length > 1 && (
                        <button
                            onClick={next}
                            className="absolute right-4 w-10 h-10 rounded-full text-white flex items-center justify-center text-xl transition-all z-10"
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

                    {photos.length > 1 && (
                        <span
                            className="absolute bottom-5 text-white text-sm px-3 py-1 rounded-full"
                            style={{ background: "rgba(0,0,0,0.5)" }}
                        >
                            {lightboxIndex + 1} / {photos.length}
                        </span>
                    )}

                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full text-white flex items-center justify-center transition-all"
                        style={{
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                                "rgba(255,255,255,0.25)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                                "rgba(255,255,255,0.15)")
                        }
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
};

export default PhotosTab;
