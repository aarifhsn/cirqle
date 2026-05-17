import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/posts/PostCard";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

const PostPage = () => {
    const { id } = useParams();
    const { api } = useAxios();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${id}`,
                );
                setPost(res.data?.data ?? res.data);
            } catch (e) {
                console.error(e.response?.status, e.response?.data);
                setError("Post not found or has been deleted.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    return (
        <AppLayout>
            {loading && (
                <div className="card" style={{ padding: "1.25rem 1.4rem" }}>
                    <div className="flex gap-3 mb-4">
                        <div
                            className="skeleton"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                            }}
                        />
                        <div className="flex-1">
                            <div
                                className="skeleton mb-2"
                                style={{
                                    height: 12,
                                    width: "40%",
                                    borderRadius: 6,
                                }}
                            />
                            <div
                                className="skeleton"
                                style={{
                                    height: 10,
                                    width: "25%",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    </div>
                    <div
                        className="skeleton mb-2"
                        style={{ height: 12, width: "90%", borderRadius: 6 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 12, width: "70%", borderRadius: 6 }}
                    />
                </div>
            )}

            {error && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
                >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                        🔍
                    </span>
                    <h3
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Post not found
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {error}
                    </p>
                </div>
            )}

            {!loading && !error && post && <PostCard post={post} />}
        </AppLayout>
    );
};

export default PostPage;
