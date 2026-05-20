import { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";

const fmtPrice = (p) => `৳ ${Number(p).toLocaleString()}`;

const UserMarketplace = ({ userId }) => {
    const { api } = useAxios();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/listings`)
            .then((r) => {
                const all = r.data?.data ?? r.data ?? [];
                setListings(all.filter((l) => l.user_id === userId));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading)
        return (
            <div
                className="grid gap-3"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                }}
            >
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="card"
                        style={{ padding: 0, overflow: "hidden" }}
                    >
                        <div
                            className="skeleton"
                            style={{ height: 140, borderRadius: 0 }}
                        />
                        <div style={{ padding: "0.75rem" }}>
                            <div
                                className="skeleton mb-2"
                                style={{
                                    height: 13,
                                    width: "70%",
                                    borderRadius: 6,
                                }}
                            />
                            <div
                                className="skeleton"
                                style={{
                                    height: 16,
                                    width: "40%",
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );

    if (listings.length === 0)
        return (
            <div
                className="card flex-center flex-col"
                style={{ padding: "4rem 2rem", textAlign: "center" }}
            >
                <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    🛍️
                </span>
                <h4
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                >
                    No listings yet
                </h4>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Nothing listed for sale.
                </p>
            </div>
        );

    return (
        <div
            className="grid gap-3 animate-fade-in"
            style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
        >
            {listings.map((l) => {
                const img = l.images?.[0]
                    ? `${import.meta.env.VITE_STORAGE_URL}/${l.images[0]}`
                    : null;
                return (
                    <div
                        key={l.id}
                        className="card card-hover"
                        style={{ padding: 0, overflow: "hidden" }}
                    >
                        <div
                            style={{
                                height: 140,
                                background: img
                                    ? `url(${img}) center/cover`
                                    : "var(--bg-surface-2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                            }}
                        >
                            {!img && (
                                <span
                                    style={{ fontSize: "2rem", opacity: 0.3 }}
                                >
                                    🛍️
                                </span>
                            )}
                            {l.status === "sold" && (
                                <div
                                    className="absolute inset-0 flex-center"
                                    style={{ background: "rgba(0,0,0,0.5)" }}
                                >
                                    <span
                                        className="pill pill-danger"
                                        style={{ fontWeight: 700 }}
                                    >
                                        SOLD
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: "0.75rem" }}>
                            <p
                                style={{
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    color: "var(--text-primary)",
                                    marginBottom: 4,
                                }}
                            >
                                {l.title}
                            </p>
                            <p
                                style={{
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    color: "var(--accent)",
                                }}
                            >
                                {fmtPrice(l.price)}
                            </p>
                            {l.location && (
                                <p
                                    style={{
                                        fontSize: "0.72rem",
                                        color: "var(--text-muted)",
                                        marginTop: 3,
                                    }}
                                >
                                    📍 {l.location}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserMarketplace;
