import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegistrationPage from "./pages/RegistrationPage";

import UserProfilePage from "./pages/UserProfilePage";
import PrivateRoutes from "./routes/PrivateRoutes";

function App() {
    return (
        <>
            <Routes>
                <Route element={<PrivateRoutes />}>
                    <Route element={<HomePage />} path="/" exact />
                    <Route element={<ProfilePage />} path="/:username" />
                    <Route
                        path="/users/:username"
                        element={<UserProfilePage />}
                    />
                </Route>
                <Route element={<LoginPage />} path="/login" />
                <Route element={<RegistrationPage />} path="/register" />
                <Route element={<NotFoundPage />} path="*" />
            </Routes>
        </>
    );
}

export default App;
