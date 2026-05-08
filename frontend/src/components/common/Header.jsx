import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoDark from "../../assets/cirqle-logo-dark.png"; // 👈 add your dark logo
import LogoLight from "../../assets/cirqle-logo-light.png";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";
import Logout from "../auth/Logout";
import Avatar from "./Avatar";

const Header = () => {
    const { auth } = useAuth();
    const { state } = useProfile();
    const { api } = useAxios();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const user = auth?.user;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notificationCount] = useState(3);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
                setSearchResults([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            setShowSearch(false);
            return;
        }
        try {
            const response = await api.get(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/search?q=${query}`,
            );
            if (response.status === 200) {
                setSearchResults(response.data);
                setShowSearch(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearchSelect = (username) => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        navigate(`/${username}`);
    };

    return (
        <nav
            className="sticky top-0 z-50 glass"
            style={{
                borderBottom: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
            }}
        >
            <div className="container flex items-center justify-between gap-3 p-3">
                {/* ── Logo ───────────────────────────────────── */}
                <Link to="/" className="shrink-0 flex items-center gap-2">
                    <img
                        className="max-w-[80px] lg:max-w-[100px]"
                        src={theme === "dark" ? LogoLight : LogoDark} // 👈 swap based on theme
                        alt="Cirqle"
                    />
                </Link>

                {/* ── Search ─────────────────────────────────── */}
                <div className="relative flex-1 max-w-sm" ref={searchRef}>
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-full"
                        style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-strong)",
                            transition:
                                "border-color var(--duration) var(--ease)",
                        }}
                        onFocus={() => {}}
                    >
                        {/* Search icon */}
                        <svg
                            style={{
                                color: "var(--text-muted)",
                                flexShrink: 0,
                            }}
                            className="w-4 h-4"
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
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search people…"
                            style={{
                                background: "transparent",
                                color: "var(--text-primary)",
                                fontSize: "0.875rem",
                                outline: "none",
                                width: "100%",
                            }}
                            className="placeholder-[var(--text-muted)]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchResults([]);
                                    setShowSearch(false);
                                }}
                                style={{
                                    color: "var(--text-muted)",
                                    flexShrink: 0,
                                }}
                                className="hover:text-[var(--text-primary)] transition-colors"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Search results dropdown */}
                    {showSearch && searchResults.length > 0 && (
                        <div
                            className="absolute top-full left-0 right-0 mt-2 overflow-hidden action-modal-container"
                            style={{ zIndex: 60 }}
                        >
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() =>
                                        handleSearchSelect(result.username)
                                    }
                                    className="action-menu-item"
                                >
                                    <Avatar user={result} size="sm" />
                                    <div className="text-left">
                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                color: "var(--text-primary)",
                                            }}
                                        >
                                            {result.firstName} {result.lastName}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--text-muted)",
                                            }}
                                        >
                                            @{result.username}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showSearch &&
                        searchQuery.length >= 2 &&
                        searchResults.length === 0 && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 px-4 py-3 action-modal-container"
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                No users found for "{searchQuery}"
                            </div>
                        )}
                </div>

                {/* ── Right actions ──────────────────────────── */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Home link — desktop */}
                    <Link
                        to="/"
                        className="hidden sm:flex items-center gap-1.5 btn-ghost"
                        style={{ fontSize: "0.85rem" }}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-5.25h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"
                            />
                        </svg>
                        <span>Home</span>
                    </Link>

                    {/* ── Theme toggle ── */}
                    <button
                        onClick={toggleTheme}
                        className="icon-btn"
                        title={
                            theme === "dark"
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            /* Sun icon */
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
                                />
                            </svg>
                        ) : (
                            /* Moon icon */
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                                />
                            </svg>
                        )}
                    </button>

                    {/* ── Notification bell ── */}
                    <button
                        className="icon-btn relative"
                        aria-label="Notifications"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        {notificationCount > 0 && (
                            <span
                                className="notif-badge absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-white"
                                style={{
                                    background: "var(--danger)",
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                }}
                            >
                                {notificationCount > 9
                                    ? "9+"
                                    : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* ── Avatar dropdown ── */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-1.5 p-1 rounded-full transition-all"
                            style={{
                                background: showDropdown
                                    ? "var(--bg-elevated)"
                                    : "transparent",
                            }}
                        >
                            <Avatar user={user} size="md" />
                            <svg
                                className="w-3 h-3 transition-transform duration-200"
                                style={{
                                    color: "var(--text-muted)",
                                    transform: showDropdown
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div
                                className="absolute right-0 top-full mt-2 w-56 overflow-hidden action-modal-container"
                                style={{ zIndex: 60 }}
                            >
                                {/* User info header */}
                                <div
                                    className="px-4 py-3 flex items-center gap-3"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                                    <Avatar user={user} size="sm" />
                                    <div className="overflow-hidden">
                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 600,
                                                color: "var(--text-primary)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "0.72rem",
                                                color: "var(--text-muted)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            @{user?.username}
                                        </p>
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="py-1">
                                    <Link
                                        to={`/${user?.username}`}
                                        onClick={() => setShowDropdown(false)}
                                        className="action-menu-item"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        My Profile
                                    </Link>

                                    {/* Home — mobile only */}
                                    <Link
                                        to="/"
                                        onClick={() => setShowDropdown(false)}
                                        className="action-menu-item sm:hidden"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-5.25h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"
                                            />
                                        </svg>
                                        Home
                                    </Link>

                                    {/* Theme toggle in dropdown */}
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            setShowDropdown(false);
                                        }}
                                        className="action-menu-item"
                                    >
                                        {theme === "dark" ? (
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
                                                />
                                            </svg>
                                        )}
                                        {theme === "dark"
                                            ? "Light Mode"
                                            : "Dark Mode"}
                                    </button>

                                    <div
                                        style={{
                                            height: "1px",
                                            background: "var(--border)",
                                            margin: "4px 0",
                                        }}
                                    />
                                    <Logout isMenuItem />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
