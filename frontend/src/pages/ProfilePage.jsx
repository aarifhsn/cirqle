/* ProfilePage.jsx — Cirqle v2 (flicker fix)
 * Fix: resets notFound + activeTab + dispatches DATA_FETCHING
 * whenever the username param changes, preventing stale user
 * data from the previous profile briefly showing.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { actions } from "../actions";
import NewPost from "../components/posts/NewPost";
import MyPosts from "../components/profile/MyPosts";
import PhotosTab from "../components/profile/PhotosTab";
import ProfileInfo from "../components/profile/ProfileInfo";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { useProfile } from "../hooks/useProfile";
import AppLayout from "../layouts/AppLayout";
import NotFoundPage from "./NotFoundPage";

const PROFILE_TABS = [
    { id: "posts", label: "Posts", icon: "📝" },
    { id: "media", label: "Media", icon: "🖼️" },
    { id: "about", label: "About", icon: "👤" },
    { id: "circles", label: "Circles", icon: "⭕" },
    { id: "marketplace", label: "Marketplace", icon: "🛍️" },
    { id: "saved", label: "Saved", icon: "🔖" },
];

const ProfileSkeleton = () => (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
            <div
                className="flex justify-between items-end mb-4"
                style={{ marginTop: -44 }}
            >
                <div
                    className="skeleton"
                    style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        border: "3px solid var(--card-bg)",
                    }}
                />
                <div
                    className="skeleton"
                    style={{ width: 110, height: 36, borderRadius: 20 }}
                />
            </div>
            <div
                className="skeleton mb-2"
                style={{ height: 22, width: "40%", borderRadius: 6 }}
            />
            <div
                className="skeleton mb-4"
                style={{ height: 13, width: "28%", borderRadius: 6 }}
            />
            <div
                className="skeleton mb-2"
                style={{ height: 13, width: "100%", borderRadius: 6 }}
            />
            <div
                className="skeleton mb-5"
                style={{ height: 13, width: "65%", borderRadius: 6 }}
            />
            <div
                className="flex gap-6 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
            >
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                        <div
                            className="skeleton mx-auto mb-1"
                            style={{ width: 36, height: 20, borderRadius: 4 }}
                        />
                        <div
                            className="skeleton mx-auto"
                            style={{ width: 52, height: 11, borderRadius: 4 }}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ComingSoon = ({ tab }) => (
    <div
        className="card flex-center flex-col"
        style={{ padding: "4rem 2rem", textAlign: "center" }}
    >
        <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            {PROFILE_TABS.find((t) => t.id === tab)?.icon ?? "🚧"}
        </span>
        <h4
            className="font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
        >
            {PROFILE_TABS.find((t) => t.id === tab)?.label} — Coming Soon
        </h4>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This section is under construction.
        </p>
    </div>
);

const ProfilePage = () => {
    const { state, dispatch } = useProfile();
    const { api } = useAxios();
    const { auth } = useAuth();
    const { username } = useParams();
    const [activeTab, setActiveTab] = useState("posts");
    const [notFound, setNotFound] = useState(false);
    const isMe = auth?.user?.username === username;

    useEffect(() => {
        // Reset page state for new username
        setNotFound(false);
        setActiveTab("posts");
        dispatch({ type: actions.profile.DATA_FETCHING });

        const fetchProfile = async () => {
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${username}`,
                );
                if (response.status === 200) {
                    dispatch({
                        type: actions.profile.DATA_FETCHED,
                        data: response.data,
                    });
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    setNotFound(true);
                    return;
                }
                dispatch({
                    type: actions.profile.DATA_FETCH_ERROR,
                    error: error.message,
                });
            }
        };

        fetchProfile();
    }, [username]); // ← key fix: re-runs on every username change

    if (notFound) return <NotFoundPage />;

    return (
        <AppLayout>
            {state?.loading || !state?.user ? (
                <ProfileSkeleton />
            ) : (
                <ProfileInfo />
            )}

            {!state?.loading && state?.user && isMe && <NewPost />}

            {!state?.loading && state?.user && (
                <div className="feed-tabs">
                    {PROFILE_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`feed-tab ${activeTab === tab.id ? "active" : ""}`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {!state?.loading && state?.user && (
                <div className="animate-fade-in">
                    {activeTab === "posts" && <MyPosts />}
                    {activeTab === "media" && (
                        <PhotosTab userId={state?.user?.id} />
                    )}
                    {activeTab === "about" && <ComingSoon tab="about" />}
                    {activeTab === "circles" && <ComingSoon tab="circles" />}
                    {activeTab === "marketplace" && (
                        <ComingSoon tab="marketplace" />
                    )}
                    {activeTab === "saved" && <ComingSoon tab="saved" />}
                </div>
            )}
        </AppLayout>
    );
};

export default ProfilePage;
