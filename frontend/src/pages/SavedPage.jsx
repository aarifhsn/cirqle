import { useEffect, useState } from "react";
import PostCard from "../components/posts/PostCard";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

const SavedPage = () => {
    const { api } = useAxios();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts/saved`,
                );
                setPosts(res.data?.data ?? res.data ?? []);
            } catch (e) {
                setError("Failed to load saved posts.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <AppLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: "1.3rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        ⌑ Saved Posts
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Posts you've saved for later
                    </p>
                </div>
            </div>

            {/* Skeleton */}
            {loading && (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
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
                                className="skeleton mb-2"
                                style={{
                                    height: 12,
                                    width: "90%",
                                    borderRadius: 6,
                                }}
                            />
                            <div
                                className="skeleton"
                                style={{
                                    height: 12,
                                    width: "60%",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {error && (
                <div
                    className="card p-4"
                    style={{ background: "var(--danger-soft)" }}
                >
                    <p className="text-sm" style={{ color: "var(--danger)" }}>
                        {error}
                    </p>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && posts.length === 0 && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
                >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                        ⌑
                    </span>
                    <h3
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        No saved posts yet
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Save posts to read them later
                    </p>
                </div>
            )}

            {/* Posts */}
            {!loading && !error && posts.length > 0 && (
                <div className="flex flex-col gap-3">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onUnsave={(id) =>
                                setPosts((prev) =>
                                    prev.filter((p) => p.id !== id),
                                )
                            }
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
};

export default SavedPage;
