import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { actions } from "../actions";
import MyPosts from "../components/profile/MyPosts";
import PhotosTab from "../components/profile/PhotosTab";
import ProfileInfo from "../components/profile/ProfileInfo";
import useAxios from "../hooks/useAxios";
import { useProfile } from "../hooks/useProfile";
import AppLayout from "../layouts/AppLayout";

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

const ProfileError = () => (
    <div
        className="card flex-center flex-col"
        style={{
            padding: "3rem 2rem",
            textAlign: "center",
            background: "var(--danger-soft)",
            border: "1px solid rgba(239,68,68,0.2)",
        }}
    >
        <span style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</span>
        <h5 className="font-semibold mb-1" style={{ color: "var(--danger)" }}>
            Profile not found
        </h5>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This user may not exist or the profile is private.
        </p>
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

const UserProfilePage = () => {
    const { username } = useParams();
    const { state, dispatch } = useProfile();
    const { api } = useAxios();
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
        setActiveTab("posts");
        dispatch({ type: actions.profile.DATA_FETCHING });

        const fetchUserProfile = async () => {
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/users/${username}`,
                );
                if (response.status === 200) {
                    dispatch({
                        type: actions.profile.DATA_FETCHED,
                        data: response.data,
                    });
                }
            } catch (error) {
                dispatch({
                    type: actions.profile.DATA_FETCH_ERROR,
                    error: error.message,
                });
            }
        };

        fetchUserProfile();
    }, [username]); // ← re-runs on every username change

    return (
        <AppLayout>
            {state?.loading ? (
                <ProfileSkeleton />
            ) : state?.error ? (
                <ProfileError />
            ) : (
                <ProfileInfo />
            )}

            {!state?.loading && !state?.error && state?.user && (
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

            {!state?.loading && !state?.error && state?.user && (
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
                    {activeTab === "saved" && isMe && <UserSaved />}
                    {activeTab === "saved" && !isMe && (
                        <div
                            className="card flex-center flex-col"
                            style={{
                                padding: "4rem 2rem",
                                textAlign: "center",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "2.5rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                🔒
                            </span>
                            <p style={{ color: "var(--text-muted)" }}>
                                Saved posts are private.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
};

export default UserProfilePage;
