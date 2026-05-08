import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";

const PhotosTab = ({ userId }) => {
    const { api } = useAxios();
    const [photos, setPhotos] = useState([]);
    const [lightbox, setLightbox] = useState(null);
    const [lightboxIndex, setLightboxIndex] = useState(0);
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

    if (loading) {
        return (
            <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="aspect-square rounded-md bg-lighterDark animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-lwsGreen/10 flex items-center justify-center mb-3">
                    <svg
                        className="w-5 h-5 text-lwsGreen"
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
                <p className="text-gray-500 text-sm">No photos yet</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-1">
                {photos.map((p, index) => (
                    <div
                        key={p.id}
                        onClick={() => openLightbox(index)}
                        className="aspect-square rounded-md overflow-hidden cursor-pointer group border border-[#3F3F3F]"
                    >
                        <img
                            src={`${import.meta.env.VITE_STORAGE_URL}/${p.image}`}
                            className="w-full h-full object-cover group-hover:opacity-80 group-hover:scale-105 transition-all duration-200"
                            alt="photo"
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
                    onClick={() => setLightbox(null)}
                >
                    {photos.length > 1 && (
                        <button
                            onClick={prev}
                            className="absolute left-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-xl transition-all z-10"
                        >
                            ‹
                        </button>
                    )}

                    <img
                        src={lightbox}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        alt="full size"
                    />

                    {photos.length > 1 && (
                        <button
                            onClick={next}
                            className="absolute right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-xl transition-all z-10"
                        >
                            ›
                        </button>
                    )}

                    {photos.length > 1 && (
                        <span className="absolute bottom-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                            {lightboxIndex + 1} / {photos.length}
                        </span>
                    )}

                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all"
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
