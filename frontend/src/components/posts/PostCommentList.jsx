import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDateDifferenceFromNow } from "../../utils";
import Avatar from "../common/Avatar";

const PostCommentList = ({ comments }) => {
    const { auth } = useAuth();

    return (
        <div className="space-y-4 divide-y divide-lighterDark">
            {comments &&
                comments.map((comment) => {
                    const isMe = comment?.author?.id === auth?.user?.id;
                    const profileLink = isMe
                        ? `/${auth?.user?.username}`
                        : `/${comment?.author?.username}`;

                    return (
                        <div
                            className="flex items-start gap-3 pt-4"
                            key={comment.id}
                        >
                            <Link to={profileLink}>
                                <Avatar user={comment?.author} size="sm" />
                            </Link>
                            <div>
                                <div className="flex gap-1 text-xs lg:text-sm items-center">
                                    <Link
                                        to={profileLink}
                                        className="font-semibold hover:underline hover:text-lwsGreen"
                                    >
                                        {comment?.author?.name}:
                                    </Link>
                                    <span>{comment.comment}</span>
                                    <span className="ml-4 text-[11px] text-gray-300 hover:underline cursor-pointer grow">
                                        Reply
                                    </span>
                                </div>
                                <span className="text-[11px] text-gray-500 mt-0.5 block">
                                    {getDateDifferenceFromNow(
                                        comment?.createdAt,
                                    )}{" "}
                                </span>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default PostCommentList;
