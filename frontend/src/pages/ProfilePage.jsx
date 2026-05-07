import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { actions } from "../actions";
import PageLayout from "../components/common/PageLayout";
import NewPost from "../components/posts/NewPost";
import MyPosts from "../components/profile/MyPosts";
import PhotosTab from "../components/profile/PhotosTab";
import ProfileInfo from "../components/profile/ProfileInfo";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { useProfile } from "../hooks/useProfile";

/* ── Profile skeleton ──────────────────────────────── */
const ProfileSkeleton = () => (
    <div
        className="card"
        style={{ padding: 0, overflow: "hidden", marginBottom: "1rem" }}
    >
        {/* cover */}
        <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
            {/* avatar */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: -40,
                    marginBottom: "1rem",
                }}
            >
                <div
                    className="skeleton"
                    style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        border: "3px solid var(--bg-card)",
                    }}
                />
                <div
                    className="skeleton"
                    style={{
                        width: 110,
                        height: 36,
                        borderRadius: "var(--r-full)",
                    }}
                />
            </div>
            <div
                className="skeleton"
                style={{
                    height: 22,
                    width: "45%",
                    borderRadius: 6,
                    marginBottom: 8,
                }}
            />
            <div
                className="skeleton"
                style={{
                    height: 13,
                    width: "30%",
                    borderRadius: 6,
                    marginBottom: 16,
                }}
            />
            <div
                className="skeleton"
                style={{
                    height: 13,
                    width: "70%",
                    borderRadius: 6,
                    marginBottom: 20,
                }}
            />
            <div
                style={{
                    display: "flex",
                    gap: "1.5rem",
                    paddingTop: "0.875rem",
                    borderTop: "1px solid var(--border)",
                }}
            >
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                        <div
                            className="skeleton"
                            style={{
                                width: 36,
                                height: 20,
                                borderRadius: 4,
                                margin: "0 auto 4px",
                            }}
                        />
                        <div
                            className="skeleton"
                            style={{
                                width: 48,
                                height: 11,
                                borderRadius: 4,
                                margin: "0 auto",
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ── ProfilePage ───────────────────────────────────── */
const ProfilePage = () => {
    const { state, dispatch } = useProfile();
    const { api } = useAxios();
    const { auth } = useAuth();
    const { username } = useParams();
    const [activeTab, setActiveTab] = useState("posts");

    const isMe = auth?.user?.username === username;

    useEffect(() => {
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
                console.error(error);
                dispatch({
                    type: actions.profile.DATA_FETCH_ERROR,
                    error: error.message,
                });
            }
        };

        fetchProfile();
    }, [username]);

    return (
        <PageLayout>
            {/* Profile card */}
            {state?.loading || !state?.user ? (
                <ProfileSkeleton />
            ) : (
                <ProfileInfo />
            )}

            {/* New post — own profile only */}
            {!state?.loading && state?.user && isMe && <NewPost />}

            {/* Tab bar */}
            {!state?.loading && state?.user && (
                <div
                    style={{
                        display: "flex",
                        gap: "0.25rem",
                        margin: "1.25rem 0 0.75rem",
                        borderBottom: "1px solid var(--border)",
                        paddingBottom: "0",
                    }}
                >
                    {["posts", "photos"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "0.5rem 1.1rem 0.75rem",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                fontFamily: "'DM Sans', sans-serif",
                                background: "none",
                                border: "none",
                                borderBottom:
                                    activeTab === tab
                                        ? "2px solid var(--accent)"
                                        : "2px solid transparent",
                                color:
                                    activeTab === tab
                                        ? "var(--accent)"
                                        : "var(--text-muted)",
                                cursor: "pointer",
                                textTransform: "capitalize",
                                transition: "all 150ms ease",
                                marginBottom: "-1px",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab content */}
            {!state?.loading &&
                state?.user &&
                (activeTab === "posts" ? (
                    <MyPosts />
                ) : (
                    <PhotosTab userId={state?.user?.id} />
                ))}
        </PageLayout>
    );
};

export default ProfilePage;
