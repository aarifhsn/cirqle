// ─── PostCard.jsx ────────────────────────────────────────────────────────────
import { useState } from "react";
import PostAction from "./PostAction";
import PostBody from "./PostBody";
import PostComments from "./PostComments";
import PostHeader from "./PostHeader";

export const PostCard = ({ post }) => {
    const [comments, setComments] = useState(post?.comments ?? []);
    return (
        <article
            className="card"
            style={{
                marginBottom: "1rem",
                padding: "1.25rem 1.5rem",
                transition: "box-shadow 200ms ease, border-color 200ms ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
        >
            <PostHeader post={post} />
            <PostBody poster={post?.image} content={post?.content} />
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
