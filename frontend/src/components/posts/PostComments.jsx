import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "../common/Avatar";
import PostCommentList from "./PostCommentList";

const PostComments = ({ post }) => {
    const { auth } = useAuth();
    const [comments, setComments] = useState(post?.comments ?? []);
    const [comment, setComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // { id, name }
    const [showAll, setShowAll] = useState(false);
    const { api } = useAxios();

    const COMMENTS_PER_PAGE = 3;
    const visibleComments = showAll
        ? comments
        : comments.slice(0, COMMENTS_PER_PAGE);

    const addComment = async (e) => {
        if (e.keyCode !== 13 || !comment.trim()) return;

        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}/comment`,
                {
                    comment,
                    parent_id: replyingTo?.id ?? null,
                },
            );

            if (response.status === 200) {
                setComments(response.data.comments);
                setComment("");
                setReplyingTo(null);
            }
        } catch (error) {
            console.error(error);
            const message =
                error.response?.data?.message || "Failed to add comment!";
            toast.error(message);
        }
    };

    return (
        <div>
            {comments.length > COMMENTS_PER_PAGE && (
                <button
                    className="text-gray-400 text-sm hover:text-white mb-3"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll
                        ? "Show less ▴"
                        : `View all ${comments.length} comments ▾`}
                </button>
            )}

            <PostCommentList
                comments={visibleComments}
                onReply={(id, name) => {
                    setReplyingTo({ id, name });
                    setComment(`@${name} `);
                }}
            />

            {/* Input */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#3F3F3F]">
                <Avatar user={auth?.user} size="sm" />
                <div className="flex-1 relative">
                    {replyingTo && (
                        <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                            <span>
                                Replying to{" "}
                                <span className="text-lwsGreen">
                                    {replyingTo.name}
                                </span>
                            </span>
                            <button
                                onClick={() => {
                                    setReplyingTo(null);
                                    setComment("");
                                }}
                                className="text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <input
                        type="text"
                        className="h-8 w-full rounded-full bg-slate-400 dark:bg-lighterDark px-4 text-xs focus:outline-none sm:h-[38px]"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={addComment}
                        placeholder={
                            replyingTo
                                ? `Reply to ${replyingTo.name}...`
                                : "Write a comment and press Enter..."
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default PostComments;
