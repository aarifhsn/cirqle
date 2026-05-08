import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegistrationPage from "./pages/RegistrationPage";

import ScrollToTop from "./components/common/ScrollToTop";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import GoogleSuccess from "./pages/GoogleSuccess";
import NotificationsPage from "./pages/NotificationsPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserProfilePage from "./pages/UserProfilePage";
import PrivateRoutes from "./routes/PrivateRoutes";

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route element={<PrivateRoutes />}>
                    <Route element={<HomePage />} path="/" exact />
                    <Route element={<ProfilePage />} path="/:username" />
                    <Route
                        path="/users/:username"
                        element={<UserProfilePage />}
                    />
                    <Route
                        element={<FollowersPage />}
                        path="/:username/followers"
                    />
                    <Route
                        element={<FollowingPage />}
                        path="/:username/following"
                    />
                    <Route
                        element={<NotificationsPage />}
                        path="/notifications"
                    />

                    <Route path="/not-found" element={<NotFoundPage />} />
                </Route>
                <Route element={<LoginPage />} path="/login" />
                <Route element={<RegistrationPage />} path="/register" />

                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/google-success" element={<GoogleSuccess />} />
            </Routes>
        </>
    );
}

export default App;
