import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import PostCard from "../posts/PostCard";

const UserSaved = () => {
    const { api } = useAxios();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/posts/saved`)
            .then((r) => setPosts(r.data?.data ?? r.data ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="card"
                        style={{ padding: "1.25rem 1.4rem" }}
                    >
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
                            className="skeleton"
                            style={{
                                height: 12,
                                width: "90%",
                                borderRadius: 6,
                            }}
                        />
                    </div>
                ))}
            </div>
        );

    if (posts.length === 0)
        return (
            <div
                className="card flex-center flex-col"
                style={{ padding: "4rem 2rem", textAlign: "center" }}
            >
                <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    🔖
                </span>
                <h4
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                >
                    No saved posts
                </h4>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Posts you save will appear here.
                </p>
            </div>
        );

    return (
        <div className="flex flex-col gap-3 animate-fade-in">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onUnsave={(id) =>
                        setPosts((prev) => prev.filter((p) => p.id !== id))
                    }
                />
            ))}
        </div>
    );
};

export default UserSaved;
