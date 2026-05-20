import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDateDifferenceFromNow } from "../../utils";
import Avatar from "../common/Avatar";

const PostCommentList = ({ comments, onReply }) => {
    const { auth } = useAuth();

    const CommentItem = ({ comment, isReply = false }) => {
        const isMe = comment?.author?.id === auth?.user?.id;

        const author = isMe
            ? {
                  ...comment?.author,
                  avatar: auth?.user?.avatar,
                  name: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
                  username: auth?.user?.username,
              }
            : comment?.author;

        const profileLink = isMe
            ? `/${auth?.user?.username}`
            : `/${comment?.author?.username ?? "users/" + comment?.author?.id}`;

        return (
            <div
                className={`flex items-start gap-3 pt-3 ${isReply ? "ml-8 pl-3" : ""}`}
                style={isReply ? { borderLeft: "2px solid var(--border)" } : {}}
            >
                <Link to={profileLink} className="flex-shrink-0 mt-0.5">
                    <Avatar user={author} size="sm" />
                </Link>

                <div className="flex-1 min-w-0">
                    {/* Name + comment text */}
                    <div
                        className="flex flex-wrap gap-1 text-xs"
                        style={{ color: "var(--text-primary)" }}
                    >
                        <Link
                            to={profileLink}
                            className="font-semibold transition-colors"
                            style={{ color: "var(--text-primary)" }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "var(--accent)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                    "var(--text-primary)")
                            }
                        >
                            {author?.name}:
                        </Link>
                        <span style={{ color: "var(--text-secondary)" }}>
                            {comment.comment}
                        </span>
                    </div>

                    {/* Meta: time + reply */}
                    <div className="flex items-center gap-3 mt-1">
                        <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            {getDateDifferenceFromNow(comment?.createdAt)}
                        </span>
                        {!isReply && (
                            <button
                                onClick={() => onReply(comment.id, author.name)}
                                className="text-xs font-medium transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--text-muted)")
                                }
                            >
                                Reply
                            </button>
                        )}
                    </div>

                    {/* Nested replies */}
                    {!isReply && comment.replies?.length > 0 && (
                        <div className="mt-2 flex flex-col gap-2">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    isReply
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className="flex flex-col"
            style={{ gap: 0, divideColor: "var(--border)" }}
        >
            {comments?.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </div>
    );
};

export default PostCommentList;
