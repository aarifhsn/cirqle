import { Link } from "react-router-dom";

const UserAbout = ({ user }) => {
    if (!user) return null;

    const rows = [
        { icon: "👤", label: "Username", value: `@${user.username}` },
        { icon: "📧", label: "Email", value: user.email },
        { icon: "📍", label: "Location", value: user.location_name },
        { icon: "📝", label: "Bio", value: user.bio },
    ].filter((r) => r.value);

    return (
        <div className="card animate-fade-in" style={{ padding: "1.5rem" }}>
            <h3
                className="font-bold mb-4"
                style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                }}
            >
                About
            </h3>

            {rows.length === 0 && (
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    No information added yet.
                </p>
            )}

            <div className="flex flex-col gap-4">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "flex-start",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "1.1rem",
                                flexShrink: 0,
                                marginTop: 1,
                            }}
                        >
                            {row.icon}
                        </span>
                        <div>
                            <p
                                style={{
                                    fontSize: "0.72rem",
                                    color: "var(--text-muted)",
                                    marginBottom: 2,
                                }}
                            >
                                {row.label}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--text-primary)",
                                    lineHeight: 1.5,
                                }}
                            >
                                {row.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {rows.length > 0 && (
                <>
                    <div className="divider" style={{ margin: "1rem 0" }} />
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                        <Link
                            to={`/${user.username}/followers`}
                            style={{ textDecoration: "none" }}
                        >
                            <p
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {user.followers_count ?? 0}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Followers
                            </p>
                        </Link>
                        <Link
                            to={`/${user.username}/following`}
                            style={{ textDecoration: "none" }}
                        >
                            <p
                                style={{
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {user.following_count ?? 0}
                            </p>
                            <p
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Following
                            </p>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserAbout;
