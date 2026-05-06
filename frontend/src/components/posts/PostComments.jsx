import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "../common/Avatar";
import PostCommentList from "./PostCommentList";

const COMMENTS_PER_PAGE = 2;

const PostComments = ({ post }) => {
    const { auth } = useAuth();
    const [comments, setComments] = useState(
        [...(post?.comments ?? [])].reverse(),
    );
    const [comment, setComment] = useState("");
    const [showAll, setShowAll] = useState(false);
    const { api } = useAxios();

    const visibleComments = showAll
        ? comments
        : comments.slice(0, COMMENTS_PER_PAGE);

    const addComment = async (event) => {
        if (event.keyCode !== 13 || !comment.trim()) return;

        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${post.id}/comment`,
                { comment },
            );

            if (response.status === 200) {
                setComments([...response.data.comments].reverse());
                setComment("");
                toast.success("Comment added!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment!");
        }
    };

    return (
        <div>
            {comments.length > COMMENTS_PER_PAGE && (
                <div className="mt-2 mb-3">
                    <button
                        className="text-gray-400 text-sm hover:text-white"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll
                            ? "Show less ▴"
                            : `View all ${comments.length} comments ▾`}
                    </button>
                </div>
            )}

            <PostCommentList comments={visibleComments} />

            <div className="flex items-center my-3 gap-2 lg:gap-4">
                <Avatar user={auth?.user} size="sm" />
                <div className="flex-1">
                    <input
                        type="text"
                        className="h-8 w-full rounded-full bg-lighterDark px-4 text-xs focus:outline-none sm:h-[38px]"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={addComment}
                        placeholder="Write a comment and press Enter..."
                    />
                </div>
            </div>
        </div>
    );
};

export default PostComments;
