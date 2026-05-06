import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";

const Logout = ({ isMenuItem = false }) => {
    const { setAuth } = useAuth();
    const { api } = useAxios();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/logout`,
            );
        } catch (error) {
            console.error(error);
        } finally {
            setAuth({});
            navigate("/login");
            toast.success("Logged out successfully!");
        }
    };

    if (isMenuItem) {
        return (
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-lighterDark hover:text-red-300 transition-all"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                </svg>
                Logout
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            className="icon-btn text-red-400 hover:text-red-300"
        >
            Logout
        </button>
    );
};

export default Logout;
