import { useState } from "react";
import PostAction from "./PostAction";
import PostBody from "./PostBody";
import PostComments from "./PostComments";
import PostHeader from "./PostHeader";

export const PostCard = ({ post, onUnsave }) => {
    const [comments, setComments] = useState(post?.comments ?? []);

    return (
        <article
            className="card card-hover animate-fade-in mb-2"
            style={{ padding: "1.25rem 1.4rem 0.75rem" }}
        >
            <PostHeader post={post} onUnsave={onUnsave} />
            <PostBody
                content={post?.content}
                images={post?.images ?? []}
                poster={post?.image}
                type={post?.type}
                pollOptions={post?.poll_options ?? []}
                postId={post?.id}
            />
            <PostAction post={post} commentCount={comments?.length} />
            <PostComments
                post={post}
                comments={comments}
                setComments={setComments}
            />
        </article>
    );
};

export default PostCard;
