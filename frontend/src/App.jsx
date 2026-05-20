import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegistrationPage from "./pages/RegistrationPage";

import ScrollToTop from "./components/common/ScrollToTop";
import CirclePage from "./pages/CirclePage";
import CirclesPage from "./pages/CirclesPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage";
import EventsPage from "./pages/EventsPage";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import GoogleSuccess from "./pages/GoogleSuccess";
import JobsPage from "./pages/JobsPage";
import MarketplacePage from "./pages/MarketplacePage";
import NearbyPage from "./pages/NearbyPage";
import NotificationsPage from "./pages/NotificationsPage";
import PostPage from "./pages/PostPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SavedPage from "./pages/SavedPage";
import VerifyEmailNoticePage from "./pages/VerifyEmailNoticePage";
import PrivateRoutes from "./routes/PrivateRoutes";

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route element={<PrivateRoutes />}>
                    <Route element={<HomePage />} path="/" exact />
                    <Route element={<ProfilePage />} path="/:username" />
                    <Route path="/posts/:id" element={<PostPage />} />
                    {/* <Route
                        path="/users/:username"
                        element={<UserProfilePage />}
                    /> */}
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

                    <Route path="/nearby" element={<NearbyPage />} />
                    <Route path="/circles" element={<CirclesPage />} />
                    <Route path="/circles/:id" element={<CirclePage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/jobs" element={<JobsPage />} />

                    <Route path="/saved" element={<SavedPage />} />
                </Route>
                <Route element={<EmailVerifiedPage />} path="/email-verified" />
                <Route
                    element={<VerifyEmailNoticePage />}
                    path="/verify-email"
                />

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
