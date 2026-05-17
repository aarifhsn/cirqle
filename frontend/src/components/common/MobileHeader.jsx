import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoDark from "../../assets/cirqle-logo-dark.png";
import LogoLight from "../../assets/cirqle-logo-light.png";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "./Avatar";

const MobileHeader = () => {
    const { theme } = useTheme();
    const { auth } = useAuth();
    const { api } = useAxios();
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.trim().length < 2) {
            setResults([]);
            return;
        }
        try {
            const res = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/search?q=${q}`,
            );
            setResults(res.data);
        } catch {}
    };

    return (
        <header
            className="lg:hidden sticky top-0 z-50 glass"
            style={{ borderBottom: "1px solid var(--border)" }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 1rem",
                }}
            >
                <Link to="/" style={{ flexShrink: 0 }}>
                    <img
                        style={{ maxWidth: 70 }}
                        src={theme === "dark" ? LogoLight : LogoDark}
                        alt="Cirqle"
                    />
                </Link>

                {/* Search bar */}
                <div style={{ flex: 1, position: "relative" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "0.45rem 0.75rem",
                            borderRadius: 999,
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-strong)",
                        }}
                    >
                        <svg
                            style={{
                                color: "var(--text-muted)",
                                flexShrink: 0,
                                width: 14,
                                height: 14,
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearch}
                            onFocus={() => setShowSearch(true)}
                            placeholder="Search…"
                            style={{
                                background: "transparent",
                                color: "var(--text-primary)",
                                fontSize: "0.875rem",
                                outline: "none",
                                width: "100%",
                                border: "none",
                            }}
                        />
                    </div>

                    {showSearch && results.length > 0 && (
                        <div
                            className="action-modal-container"
                            style={{
                                position: "absolute",
                                top: "calc(100% + 6px)",
                                left: 0,
                                right: 0,
                                zIndex: 60,
                            }}
                        >
                            {results.map((r) => (
                                <button
                                    key={r.id}
                                    className="action-menu-item"
                                    onClick={() => {
                                        setQuery("");
                                        setResults([]);
                                        setShowSearch(false);
                                        navigate(`/${r.username}`);
                                    }}
                                >
                                    <Avatar user={r} size="sm" />
                                    <div className="text-left">
                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            {r.firstName} {r.lastName}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            @{r.username}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
