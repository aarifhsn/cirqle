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
                <p className="text-sm leading-relaxed text-white whitespace-pre-wrap break-words mb-3">
                    {content}
                </p>
            )}

            {/* Image grid */}
            {allImages.length > 0 && (
                <div className={`grid gap-1 ${gridClass}`}>
                    {allImages.slice(0, 3).map((src, i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-md cursor-pointer group"
                            style={{
                                aspectRatio:
                                    allImages.length === 1 ? "16/9" : "1",
                            }}
                            onClick={() => openLightbox(i)}
                        >
                            <img
                                src={src}
                                alt={`post image ${i + 1}`}
                                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            />

                            {/* +N overlay on last visible when more than 3 */}
                            {allImages.length > 3 && i === 2 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                                    +{allImages.length - 3}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={() => setLightbox(null)}
                >
                    {/* Prev button */}
                    {allImages.length > 1 && (
                        <button
                            onClick={prev}
                            className="absolute left-4 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10"
                        >
                            ‹
                        </button>
                    )}

                    <img
                        src={lightbox}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-md"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next button */}
                    {allImages.length > 1 && (
                        <button
                            onClick={next}
                            className="absolute right-4 text-white bg-black/50 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10"
                        >
                            ›
                        </button>
                    )}

                    {/* Counter */}
                    {allImages.length > 1 && (
                        <span className="absolute bottom-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                            {lightboxIndex + 1} / {allImages.length}
                        </span>
                    )}

                    {/* Close */}
                    <button
                        className="absolute top-4 right-4 text-white text-2xl bg-black/50 hover:bg-black/80 rounded-full w-9 h-9 flex items-center justify-center transition-all"
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
