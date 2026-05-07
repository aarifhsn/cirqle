import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDateDifferenceFromNow } from "../../utils";
import Avatar from "../common/Avatar";

const PostCommentList = ({ comments, onReply }) => {
    const { auth } = useAuth();

    const CommentItem = ({ comment, isReply = false }) => {
        const isMe = comment?.author?.id === auth?.user?.id;
        const profileLink = isMe
            ? "/me"
            : `/${comment?.author?.username ?? "users/" + comment?.author?.id}`;

        return (
            <div
                className={`flex items-start gap-3 pt-3 ${isReply ? "ml-8 pl-3 border-l border-[#3F3F3F]" : ""}`}
            >
                <Link to={profileLink}>
                    <Avatar
                        user={comment?.author}
                        size="sm"
                        className="mt-0.5"
                    />
                </Link>
                <div className="flex-1">
                    <div className="flex gap-1 text-xs lg:text-sm">
                        <Link
                            to={profileLink}
                            className="font-semibold hover:underline hover:text-lwsGreen"
                        >
                            {comment?.author?.name}:
                        </Link>
                        <span>{comment.comment}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-gray-500">
                            {getDateDifferenceFromNow(comment?.createdAt)} ago
                        </span>
                        {!isReply && (
                            <button
                                onClick={() =>
                                    onReply(comment.id, comment.author.name)
                                }
                                className="text-[11px] text-gray-500 hover:text-lwsGreen transition-all"
                            >
                                Reply
                            </button>
                        )}
                    </div>

                    {/* Nested replies */}
                    {!isReply && comment.replies?.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    isReply={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-2 divide-y divide-lighterDark">
            {comments?.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </div>
    );
};

export default PostCommentList;
