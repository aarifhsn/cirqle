/* PrivateRoutes.jsx — Cirqle v2
 * Changes:
 * - Removed <Header /> — replaced by LeftSidebar inside AppLayout
 * - Removed <main> wrapper + container div — AppLayout handles layout per page
 * - PostProvider + ProfileProvider kept exactly as-is
 * - Auth redirect logic untouched
 */

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
