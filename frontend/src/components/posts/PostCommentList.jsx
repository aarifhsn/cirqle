// PostCommentList.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDateDifferenceFromNow } from "../../utils";
import Avatar from "../common/Avatar";

export const PostCommentList = ({ comments }) => {
    const { auth } = useAuth();

    return (
        <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
            {comments &&
                comments.map((comment) => {
                    const isMe = comment?.author?.id === auth?.user?.id;
                    const profileLink = isMe
                        ? `/${auth?.user?.username}`
                        : `/${comment?.author?.username}`;

                    return (
                        <div
                            key={comment.id}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.625rem",
                            }}
                        >
                            <Link to={profileLink} style={{ flexShrink: 0 }}>
                                <Avatar user={comment?.author} size="sm" />
                            </Link>
                            <div
                                style={{
                                    background: "var(--bg-input)",
                                    borderRadius: "var(--r-md)",
                                    padding: "0.5rem 0.875rem",
                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: "0.5rem",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Link
                                        to={profileLink}
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.82rem",
                                            color: "var(--text-primary)",
                                            textDecoration: "none",
                                        }}
                                    >
                                        {comment?.author?.name}
                                    </Link>
                                    <span
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        {comment.comment}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "0.72rem",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        {getDateDifferenceFromNow(
                                            comment?.createdAt,
                                        )}
                                    </span>
                                    <button
                                        style={{
                                            fontSize: "0.72rem",
                                            color: "var(--text-muted)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            padding: 0,
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default PostCommentList;
