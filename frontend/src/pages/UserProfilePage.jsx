import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { actions } from "../actions";
import MyPosts from "../components/profile/MyPosts";
import ProfileInfo from "../components/profile/ProfileInfo";
import useAxios from "../hooks/useAxios";
import { useProfile } from "../hooks/useProfile";

const UserProfilePage = () => {
    const { userId } = useParams();
    const { state, dispatch } = useProfile();
    const { api } = useAxios();

    useEffect(() => {
        dispatch({ type: actions.profile.DATA_FETCHING });

        const fetchUserProfile = async () => {
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/users/${userId}`,
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
    }, [userId]);

    if (state?.loading) {
        return <div>Loading profile...</div>;
    }

    return (
        <>
            <ProfileInfo />
            <MyPosts posts={state?.posts} />
        </>
    );
};

export default UserProfilePage;
