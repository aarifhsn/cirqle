import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import AddPhoto from "../../assets/icons/addPhoto.svg";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { usePost } from "../../hooks/usePost";
import { useProfile } from "../../hooks/useProfile";
import Field from "../common/Field";
import PrivacyIcon from "./PrivacyIcon";

const PostEntry = ({ onCreate, onClose, postToEdit }) => {
    const { auth } = useAuth();
    const { dispatch } = usePost();
    const { api } = useAxios();
    const { state: profile } = useProfile();
    const user = profile?.user ?? auth?.user;

    const isEditMode = !!postToEdit;

    const [photoPreview, setPhotoPreview] = useState(
        postToEdit?.image
            ? `${import.meta.env.VITE_STORAGE_URL}/${postToEdit.image}`
            : null,
    );
    const [photoFile, setPhotoFile] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            content: postToEdit?.content ?? "",
            privacy: postToEdit?.privacy ?? "public",
        },
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handlePostSubmit = async (formData) => {
        dispatch({ type: actions.post.DATA_FETCHING });

        try {
            const data = new FormData();
            data.append("content", formData.content);
            if (photoFile) {
                data.append("photo", photoFile);
            }
            data.append("privacy", formData.privacy);

            let response;

            if (isEditMode) {
                response = await api.patch(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${postToEdit.id}`,
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } },
                );

                if (response.status === 200) {
                    dispatch({
                        type: actions.post.DATA_EDITED,
                        data: response.data,
                    });
                    toast.success("Post updated successfully!");
                }
            } else {
                response = await api.post(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts`,
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } },
                );

                if (response.status === 200) {
                    dispatch({
                        type: actions.post.DATA_CREATED,
                        data: response.data,
                    });
                    toast.success("Post created successfully!");
                }
            }

            onCreate();
        } catch (error) {
            console.error(error);
            // log actual validation errors
            if (error.response?.data?.errors) {
                console.error(error.response.data.errors);
            }
            toast.error("Something went wrong!");
            dispatch({
                type: actions.post.DATA_FETCH_ERROR,
                error: error.message,
            });
        }
    };

    return (
        <div className="card relative">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl font-bold"
            >
                ✕
            </button>

            <h6 className="mb-3 text-center text-lg font-bold lg:text-xl">
                {isEditMode ? "Edit Post" : "Create Post"}
            </h6>

            <form onSubmit={handleSubmit(handlePostSubmit)}>
                <div className="mb-3 flex items-center gap-3 lg:mb-6">
                    {user?.avatar && (
                        <img
                            className="max-w-10 max-h-10 rounded-full lg:max-h-[58px] lg:max-w-[58px]"
                            src={`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}
                            alt="avatar"
                        />
                    )}
                    <div>
                        <h6 className="text-lg lg:text-xl flex items-center gap-2">
                            {user?.firstName} {user?.lastName}
                            <PrivacyIcon privacy={watch("privacy")} />
                        </h6>
                        <span className="text-sm text-gray-400 lg:text-base">
                            {/* add a privacy selector dropdown before submit  */}
                            <select
                                {...register("privacy", {
                                    required: "Privacy setting is required!",
                                })}
                                className="bg-transparent border border-gray-700 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 py-2 rounded-md mt-2"
                            >
                                <option value="public">Public</option>
                                <option value="followers">Followers</option>
                                <option value="only_me">Only Me</option>
                            </select>
                        </span>
                    </div>
                </div>

                <Field label="" error={errors.content}>
                    <textarea
                        {...register("content", {
                            required: "Adding some text is mandatory!",
                        })}
                        id="content"
                        placeholder="Share your thoughts..."
                        className="h-[120px] w-full bg-transparent focus:outline-none lg:h-[160px]"
                    />
                </Field>

                {/* Photo preview */}
                {photoPreview && (
                    <div className="relative mb-3">
                        <img
                            src={photoPreview}
                            alt="preview"
                            className="w-full max-h-[300px] object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setPhotoPreview(null);
                                setPhotoFile(null);
                            }}
                            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="border-t border-[#3F3F3F] pt-4 lg:pt-6 flex items-center justify-between">
                    <label
                        className="btn-primary cursor-pointer !text-gray-100"
                        htmlFor="photo"
                    >
                        <img src={AddPhoto} alt="Add Photo" />
                        {photoPreview ? "Change Photo" : "Add Photo"}
                    </label>
                    <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                    />

                    <button
                        className="auth-input bg-lwsGreen font-bold text-deepDark transition-all hover:opacity-90 max-w-[120px]"
                        type="submit"
                    >
                        {isEditMode ? "Update" : "Post"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostEntry;
