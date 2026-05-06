// ProfilePage.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom"; // 👈
import { actions } from "../actions";
import NewPost from "../components/posts/NewPost";
import MyPosts from "../components/profile/MyPosts";
import ProfileInfo from "../components/profile/ProfileInfo";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";
import { useProfile } from "../hooks/useProfile";

const ProfilePage = () => {
    const { state, dispatch } = useProfile();
    const { api } = useAxios();
    const { auth } = useAuth();
    const { username } = useParams(); // 👈 e.g. "aarifhsn"

    useEffect(() => {
        dispatch({ type: actions.profile.DATA_FETCHING });

        const fetchProfile = async () => {
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${username}`, // 👈 use username
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
    }, [username]); // 👈 re-fetch when username changes

    if (state?.loading || !state?.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-400">Loading profile...</div>
            </div>
        );
    }

    const isMe = auth?.user?.username === username; // 👈 only show NewPost for own profile

    return (
        <div className="max-w-[1020px] mx-auto">
            <ProfileInfo />
            {isMe && <NewPost />} {/* 👈 hide on other people's profiles */}
            <div className="px-4">
                <MyPosts />
            </div>
        </div>
    );
};

export default ProfilePage;
