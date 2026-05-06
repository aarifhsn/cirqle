import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";
import Logout from "../auth/Logout";

import HomeIcon from "../../assets/icons/home.svg";
import Notification from "../../assets/icons/notification.svg";
import Logo from "../../assets/images/logo.svg";
import Avatar from "./Avatar";

const Header = () => {
    const { auth } = useAuth();
    const { state } = useProfile();
    const { api } = useAxios();
    const navigate = useNavigate();

    const user = auth?.user;
    const profileUser = state?.user;

    // use latest avatar — if i updated avatar in profile, reflect in header
    const displayAvatar =
        profileUser?.id === user?.id ? profileUser?.avatar : user?.avatar;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notificationCount] = useState(3); // placeholder until notifications feature

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // close dropdown and search on outside click
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

    // search users
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

    const handleSearchSelect = (userId) => {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearch(false);
        navigate(userId === user?.id ? "/me" : `/users/${userId}`);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-[#3F3F3F] bg-[#1E1F24] shadow-lg">
            <div className="container flex items-center justify-between gap-4 py-3">
                {/* Logo */}
                <Link to="/" className="shrink-0">
                    <img
                        className="max-w-[90px] lg:max-w-[120px]"
                        src={Logo}
                        alt="logo"
                    />
                </Link>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md" ref={searchRef}>
                    <div className="flex items-center gap-2 rounded-full bg-[#27292F] px-4 py-2">
                        <svg
                            className="w-4 h-4 text-gray-400 shrink-0"
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
                            placeholder="Search people..."
                            className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchResults([]);
                                    setShowSearch(false);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearch && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 rounded-md border border-[#3F3F3F] bg-[#1E1F24] shadow-xl overflow-hidden">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() =>
                                        handleSearchSelect(result.id)
                                    }
                                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#27292F] transition-all"
                                >
                                    <Avatar user={result} size="sm" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">
                                            {result.firstName} {result.lastName}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {result.email}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {showSearch &&
                        searchQuery.length >= 2 &&
                        searchResults.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-md border border-[#3F3F3F] bg-[#1E1F24] shadow-xl px-4 py-3 text-sm text-gray-400">
                                No users found for "{searchQuery}"
                            </div>
                        )}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Home */}
                    <Link
                        to="/"
                        className="hidden sm:flex items-center gap-2 rounded-md bg-lighterDark px-4 py-2 text-sm font-medium text-white hover:bg-[#2f3136] transition-all"
                    >
                        <img src={HomeIcon} alt="Home" className="w-4 h-4" />
                        <span>Home</span>
                    </Link>

                    {/* Notification Bell */}
                    <button className="relative p-2 rounded-md bg-lighterDark hover:bg-[#2f3136] transition-all">
                        <img
                            src={Notification}
                            alt="Notification"
                            className="w-5 h-5"
                        />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {notificationCount > 9
                                    ? "9+"
                                    : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Avatar Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 rounded-full p-1 hover:bg-lighterDark transition-all"
                        >
                            <Avatar user={user} size="md" />
                            {/* Dropdown Arrow */}
                            <svg
                                className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-56 rounded-md border border-[#3F3F3F] bg-[#1E1F24] shadow-xl overflow-hidden">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-[#3F3F3F]">
                                    <p className="text-sm font-semibold text-white">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {user?.email}
                                    </p>
                                </div>
                                {/* Menu Items */}
                                <div className="py-1">
                                    <Link
                                        to={`/${user?.username}`}
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-lighterDark hover:text-white transition-all"
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

                                    <Link
                                        to="/"
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-lighterDark hover:text-white transition-all sm:hidden"
                                    >
                                        <img
                                            src={HomeIcon}
                                            alt="Home"
                                            className="w-4 h-4"
                                        />
                                        Home
                                    </Link>

                                    <div className="border-t border-[#3F3F3F] mt-1 pt-1">
                                        <Logout isMenuItem />
                                    </div>
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
