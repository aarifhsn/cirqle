import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAxios from "../../hooks/useAxios";

const UserCircles = ({ userId }) => {
    const { api } = useAxios();
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/circles`)
            .then((r) => {
                const all = r.data?.data ?? r.data ?? [];
                setCircles(all.filter((c) => c.is_member));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading)
        return (
            <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-4 flex gap-3 items-center">
                        <div
                            className="skeleton"
                            style={{ width: 44, height: 44, borderRadius: 10 }}
                        />
                        <div className="flex-1">
                            <div
                                className="skeleton mb-2"
                                style={{
                                    height: 13,
                                    width: "40%",
                                    borderRadius: 6,
                                }}
                            />
                            <div
                                className="skeleton"
                                style={{
                                    height: 11,
                                    width: "25%",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );

    if (circles.length === 0)
        return (
            <div
                className="card flex-center flex-col"
                style={{ padding: "4rem 2rem", textAlign: "center" }}
            >
                <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    ⭕
                </span>
                <h4
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                >
                    No circles yet
                </h4>
                <p
                    className="text-sm mb-4"
                    style={{ color: "var(--text-muted)" }}
                >
                    Haven't joined any circles.
                </p>
                <Link to="/circles" className="btn btn-primary btn-sm">
                    Browse Circles
                </Link>
            </div>
        );

    return (
        <div className="flex flex-col gap-3">
            {circles.map((c) => (
                <Link
                    key={c.id}
                    to={`/circles/${c.id}`}
                    className="card card-hover animate-fade-in"
                    style={{
                        padding: "1rem 1.25rem",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            background: "var(--accent-soft)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.4rem",
                            flexShrink: 0,
                        }}
                    >
                        {c.emoji || "⭕"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                            style={{
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                color: "var(--text-primary)",
                            }}
                        >
                            {c.name}
                        </p>
                        <p
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                            }}
                        >
                            {c.members_count ?? 0} members ·{" "}
                            {c.category ?? "General"}
                        </p>
                    </div>
                    <span
                        className="pill pill-success"
                        style={{ fontSize: "0.68rem" }}
                    >
                        Joined
                    </span>
                </Link>
            ))}
        </div>
    );
};

export default UserCircles;
