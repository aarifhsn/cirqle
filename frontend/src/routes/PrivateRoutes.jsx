import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PostProvider from "../providers/PostProvider";
import ProfileProvider from "../providers/ProfileProvider";

const PrivateRoutes = () => {
    const { auth } = useAuth();

    if (!auth.authToken) {
        return <Navigate to="/login" />;
    }

    return (
        <PostProvider>
            <ProfileProvider>
                <Outlet />
            </ProfileProvider>
        </PostProvider>
    );
};

export default PrivateRoutes;
