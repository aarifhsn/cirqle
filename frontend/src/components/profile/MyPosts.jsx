import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import PostList from "../posts/PostList";

const MyPosts = () => {
    const { state } = useProfile();
    const { auth } = useAuth();
    const posts = state?.posts;
    const isMe = Number(state?.user?.id) === Number(auth?.user?.id);

    return (
        <div className="mt-6">
            <h4 className="text-xl lg:text-2xl font-semibold mb-4">
                {isMe
                    ? "My Posts"
                    : `${state?.user?.firstName ?? "User"}'s Posts`}
            </h4>
            {posts?.length === 0 ? (
                <div className="card text-center text-gray-400 py-12">
                    No posts yet.
                </div>
            ) : (
                <PostList posts={posts} />
            )}
        </div>
    );
};

export default MyPosts;
