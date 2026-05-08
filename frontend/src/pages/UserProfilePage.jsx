import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { actions } from "../actions";
import PageLayout from "../components/common/PageLayout";
import MyPosts from "../components/profile/MyPosts";
import PhotosTab from "../components/profile/PhotosTab";
import ProfileInfo from "../components/profile/ProfileInfo";
import useAxios from "../hooks/useAxios";
import { useProfile } from "../hooks/useProfile";

/* ── Profile skeleton (reused) ─────────────────────── */
const ProfileSkeleton = () => (
    <div
        className="card"
        style={{ padding: 0, overflow: "hidden", marginBottom: "1rem" }}
    >
        <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
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

/* ── Error state ───────────────────────────────────── */
const ProfileError = () => (
    <div
        className="card"
        style={{
            padding: "3rem 2rem",
            textAlign: "center",
            background: "var(--danger-soft)",
            border: "1px solid rgba(255,77,109,0.2)",
        }}
    >
        <div
            style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(255,77,109,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
            }}
        >
            <svg
                style={{ width: 24, height: 24, color: "var(--danger)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        </div>
        <h5
            style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--danger)",
                marginBottom: "0.4rem",
            }}
        >
            Profile not found
        </h5>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            This user may not exist or the profile is private.
        </p>
    </div>
);

/* ── UserProfilePage ───────────────────────────────── */
const UserProfilePage = () => {
    const { username } = useParams();
    const { state, dispatch } = useProfile();
    const { api } = useAxios();
    const [activeTab, setActiveTab] = useState("posts");

    useEffect(() => {
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
                console.error(error);
                dispatch({
                    type: actions.profile.DATA_FETCH_ERROR,
                    error: error.message,
                });
            }
        };

        fetchUserProfile();
    }, [username]);

    return (
        <PageLayout>
            {/* Profile card */}
            {state?.loading ? (
                <ProfileSkeleton />
            ) : state?.error ? (
                <ProfileError />
            ) : (
                <ProfileInfo />
            )}

            {/* Tab bar */}
            {!state?.loading && !state?.error && state?.user && (
                <div
                    style={{
                        display: "flex",
                        gap: "0.25rem",
                        margin: "1.25rem 0 0.75rem",
                        borderBottom: "1px solid var(--border)",
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
                !state?.error &&
                state?.user &&
                (activeTab === "posts" ? (
                    <MyPosts />
                ) : (
                    <PhotosTab userId={state?.user?.id} />
                ))}
        </PageLayout>
    );
};

export default UserProfilePage;
