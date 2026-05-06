import { useState } from "react";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import useAxios from "../../hooks/useAxios";
import { useProfile } from "../../hooks/useProfile";

const EditProfileModal = ({ onClose }) => {
    const { state, dispatch } = useProfile();
    const { api } = useAxios();

    const [form, setForm] = useState({
        firstName: state?.user?.firstName ?? "",
        lastName: state?.user?.lastName ?? "",
        bio: state?.user?.bio ?? "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.patch(
                `${import.meta.env.VITE_SERVER_BASE_URL}/profile/${state?.user?.id}`,
                form,
            );
            if (response.status === 200) {
                dispatch({
                    type: actions.profile.USER_DATA_EDITED,
                    data: response.data,
                });
                toast.success("Profile updated!");
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile!");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="w-full max-w-md mx-4 rounded-md border border-[#3F3F3F] bg-mediumDark p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Bio
                        </label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={4}
                            maxLength={500}
                            className="auth-input resize-none"
                            placeholder="Write something about yourself..."
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {form.bio.length}/500
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-md bg-lighterDark text-white hover:bg-[#2f3136] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2 rounded-md bg-lwsGreen text-deepDark font-bold hover:opacity-90 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
