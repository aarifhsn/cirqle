import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

const PostAction = ({ post, commentCount }) => {
    const { auth } = useAuth();
    const [liked, setLiked] = useState(post?.likes?.includes(auth?.user?.id));
    const [likeCount, setLikeCount] = useState(post?.likes?.length ?? 0);
    const [showShare, setShowShare] = useState(false);
    const shareRef = useRef(null);
    const { api } = useAxios();

    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const postText = encodeURIComponent(post?.content?.slice(0, 100) ?? "");
    const encodedUrl = encodeURIComponent(postUrl);

    // close share dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (shareRef.current && !shareRef.current.contains(e.target)) {
                setShowShare(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLike = async () => {
        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}/like`,
            );
            if (response.status === 200) {
                const nowLiked = !liked;
                setLiked(nowLiked);
                setLikeCount((prev) => (nowLiked ? prev + 1 : prev - 1));
            }
        } catch (error) {
            toast.error("Failed to update like!");
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied!");
        setShowShare(false);
    };

    const shareOptions = [
        {
            label: "WhatsApp",
            icon: (
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.533 5.855L.057 23.926a.75.75 0 00.918.919l6.184-1.516A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.956 9.956 0 01-5.13-1.42l-.36-.214-3.733.915.946-3.635-.235-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
            ),
            color: "text-green-400",
            href: `https://wa.me/?text=${postText}%20${encodedUrl}`,
        },
        {
            label: "Gmail",
            icon: (
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.641l8.073-6.148C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
            ),
            color: "text-red-400",
            href: `https://mail.google.com/mail/?view=cm&body=${postText}%20${encodedUrl}`,
        },
        {
            label: "Facebook",
            icon: (
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            ),
            color: "text-blue-400",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            label: "X (Twitter)",
            icon: (
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            color: "text-sky-400",
            href: `https://twitter.com/intent/tweet?text=${postText}&url=${encodedUrl}`,
        },
    ];

    return (
        <div className="flex items-center gap-1 py-2 border-t border-b border-[#3F3F3F] my-3">
            {/* Like */}
            <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                    liked
                        ? "text-lwsGreen bg-lwsGreen/10 border-lwsGreen/20"
                        : "text-gray-400 bg-transparent border-transparent hover:bg-lighterDark"
                }`}
            >
                {liked ? (
                    <svg className="w-4 h-4 fill-lwsGreen" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                ) : (
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                )}
                {liked ? "Liked" : "Like"}
                {likeCount > 0 && (
                    <span
                        className={`text-xs font-semibold px-1.5 rounded-full ${liked ? "bg-lwsGreen/20 text-lwsGreen" : "bg-lighterDark text-gray-500"}`}
                    >
                        {likeCount}
                    </span>
                )}
            </button>

            {/* Comment */}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-400 border border-transparent hover:bg-lighterDark transition-all">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                Comment
                {commentCount > 0 && (
                    <span className="text-xs font-semibold px-1.5 rounded-full bg-lighterDark text-gray-500">
                        {commentCount}
                    </span>
                )}
            </button>

            {/* Share dropdown — pushed right */}
            <div className="relative ml-auto" ref={shareRef}>
                <button
                    onClick={() => setShowShare(!showShare)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all ${
                        showShare
                            ? "text-lwsGreen bg-lwsGreen/10 border-lwsGreen/20"
                            : "text-gray-400 bg-transparent border-transparent hover:bg-lighterDark"
                    }`}
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
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                    Share
                </button>

                {/* Dropdown */}
                {showShare && (
                    <div className="absolute right-0 bottom-full mb-2 w-44 rounded-lg border border-[#3F3F3F] bg-[#1E1F24] shadow-xl overflow-hidden z-20">
                        <p className="text-[11px] text-gray-500 px-3 pt-2 pb-1 uppercase tracking-wider">
                            Share via
                        </p>

                        {shareOptions.map((opt) => (
                            <a
                                key={opt.label}
                                href={opt.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShowShare(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-lighterDark transition-all"
                            >
                                <span className={opt.color}>{opt.icon}</span>
                                <span className="text-sm text-gray-300">
                                    {opt.label}
                                </span>
                            </a>
                        ))}

                        {/* Divider + Copy */}
                        <div className="border-t border-[#3F3F3F]">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2.5 w-full px-3 py-2.5 hover:bg-lighterDark transition-all"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-sm text-gray-300">
                                    Copy Link
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostAction;
