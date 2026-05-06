import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PostEntry from "./PostEntry";

const NewPost = () => {
    const [showPostEntry, setShowPostEntry] = useState(false);
    const { auth } = useAuth();

    return (
        <>
            <div className="card">
                <div className="flex items-center mb-3 gap-2 lg:gap-4">
                    {auth?.user?.avatar && (
                        <img
                            className="max-w-10 max-h-10 rounded-full lg:max-h-[58px] lg:max-w-[58px]"
                            src={`${import.meta.env.VITE_STORAGE_URL}/${auth.user.avatar}`}
                            alt="avatar"
                        />
                    )}
                    <div className="flex-1">
                        <textarea
                            className="h-16 w-full rounded-md bg-lighterDark p-3 focus:outline-none sm:h-20 sm:p-6 cursor-pointer"
                            placeholder="What's on your mind?"
                            readOnly
                            onClick={() => setShowPostEntry(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {showPostEntry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-xl mx-4">
                        <PostEntry
                            onCreate={() => setShowPostEntry(false)}
                            onClose={() => setShowPostEntry(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default NewPost;
