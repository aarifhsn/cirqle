import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";

const PhotosTab = ({ userId }) => {
    const { api } = useAxios();
    const [photos, setPhotos] = useState([]);
    const [lightbox, setLightbox] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.5rem",
                }}
            >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="skeleton"
                        style={{
                            aspectRatio: "1",
                            borderRadius: "var(--r-md)",
                        }}
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div
                className="card"
                style={{ padding: "3rem 2rem", textAlign: "center" }}
            >
                <div
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "var(--accent-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                    }}
                >
                    <svg
                        style={{
                            width: 22,
                            height: 22,
                            color: "var(--accent)",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    No photos yet
                </p>
            </div>
        );
    }

    return (
        <>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.5rem",
                }}
            >
                {photos.map((p) => (
                    <div
                        key={p.id}
                        onClick={() =>
                            setLightbox(
                                `${import.meta.env.VITE_STORAGE_URL}/${p.image}`,
                            )
                        }
                        style={{
                            aspectRatio: "1",
                            borderRadius: "var(--r-md)",
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "1px solid var(--border)",
                            transition:
                                "transform 150ms ease, box-shadow 150ms ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.02)";
                            e.currentTarget.style.boxShadow =
                                "var(--shadow-md)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <img
                            src={`${import.meta.env.VITE_STORAGE_URL}/${p.image}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                            }}
                            alt="photo"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="modal-overlay"
                    onClick={() => setLightbox(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 60,
                        background: "rgba(0,0,0,0.92)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1.5rem",
                    }}
                >
                    <img
                        src={lightbox}
                        style={{
                            maxHeight: "90vh",
                            maxWidth: "90vw",
                            objectFit: "contain",
                            borderRadius: "var(--r-lg)",
                            boxShadow: "var(--shadow-lg)",
                        }}
                        alt="full size"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightbox(null)}
                        className="icon-btn"
                        style={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#fff",
                        }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
};

export default PhotosTab;
