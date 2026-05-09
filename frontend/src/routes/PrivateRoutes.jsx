import { Navigate, Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import { useAuth } from "../hooks/useAuth";

import PostProvider from "../providers/PostProvider";
import ProfileProvider from "../providers/ProfileProvider";

const PrivateRoutes = () => {
    const { auth } = useAuth();

    return (
        <>
            {auth.authToken ? (
                <>
                    <PostProvider>
                        <ProfileProvider>
                            <Header />
                            <main
                                className="mx-auto max-w-full pb-8"
                                style={{ margin: "0 auto" }}
                            >
                                <div className="container">
                                    <Outlet />
                                </div>
                            </main>
                        </ProfileProvider>
                    </PostProvider>
                </>
            ) : (
                <Navigate to="/login" />
            )}
        </>
    );
};

export default PrivateRoutes;
