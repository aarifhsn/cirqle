import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";

const PhotosTab = ({ userId }) => {
    const { api } = useAxios();
    const [photos, setPhotos] = useState([]);
    const [lightbox, setLightbox] = useState(null); // selected photo url

    useEffect(() => {
        api.get(
            `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${userId}/photos`,
        ).then((r) => setPhotos(r.data));
    }, [userId]);

    return (
        <div>
            <div className="grid grid-cols-3 gap-1">
                {photos.map((p) => (
                    <img
                        key={p.id}
                        src={`${import.meta.env.VITE_STORAGE_URL}/${p.image}`}
                        className="w-full aspect-square object-cover cursor-pointer hover:opacity-80 transition-all"
                        onClick={() =>
                            setLightbox(
                                `${import.meta.env.VITE_STORAGE_URL}/${p.image}`,
                            )
                        }
                    />
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
                    onClick={() => setLightbox(null)}
                >
                    <img
                        src={lightbox}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                    />
                    <button className="absolute top-4 right-4 text-white text-2xl">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};
