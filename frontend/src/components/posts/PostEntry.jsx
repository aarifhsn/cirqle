import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { actions } from "../../actions";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import { usePost } from "../../hooks/usePost";
import { useProfile } from "../../hooks/useProfile";
import Avatar from "../common/Avatar";
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
        formState: { errors, isSubmitting },
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
            if (photoFile) data.append("photo", photoFile);
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
                    toast.success("Post updated!");
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
                    toast.success("Post created!");
                }
            }
            onCreate();
        } catch (error) {
            console.error(error);
            if (error.response?.data?.errors)
                console.error(error.response.data.errors);
            toast.error("Something went wrong!");
            dispatch({
                type: actions.post.DATA_FETCH_ERROR,
                error: error.message,
            });
        }
    };

    return (
        <div
            className="card"
            style={{
                padding: "1.5rem",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.25rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <h3
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                    }}
                >
                    {isEditMode ? "Edit Post" : "Create Post"}
                </h3>
                <button
                    onClick={onClose}
                    className="icon-btn"
                    style={{ width: 32, height: 32 }}
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
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit(handlePostSubmit)}>
                {/* Author row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                    }}
                >
                    <Avatar user={user} size="md" />
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                marginBottom: "0.3rem",
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {user?.firstName} {user?.lastName}
                            </span>
                            <PrivacyIcon privacy={watch("privacy")} />
                        </div>
                        <select
                            {...register("privacy", {
                                required: "Privacy setting is required!",
                            })}
                            style={{
                                background: "var(--bg-input)",
                                border: "1px solid var(--border-strong)",
                                borderRadius: "var(--r-sm)",
                                color: "var(--text-secondary)",
                                fontSize: "0.78rem",
                                padding: "0.25rem 0.5rem",
                                outline: "none",
                                cursor: "pointer",
                            }}
                        >
                            <option value="public">🌐 Public</option>
                            <option value="followers">👥 Followers</option>
                            <option value="only_me">🔒 Only Me</option>
                        </select>
                    </div>
                </div>

                {/* Content textarea */}
                <Field label="" error={errors.content}>
                    <textarea
                        {...register("content", {
                            required: "Please add some text!",
                        })}
                        id="content"
                        placeholder={`What's on your mind, ${user?.firstName}?`}
                        style={{
                            width: "100%",
                            minHeight: 120,
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            resize: "none",
                            fontSize: "1rem",
                            lineHeight: 1.6,
                            color: "var(--text-primary)",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                        className="placeholder-[var(--text-muted)]"
                    />
                </Field>

                {/* Photo preview */}
                {photoPreview && (
                    <div
                        style={{
                            position: "relative",
                            marginBottom: "1rem",
                            borderRadius: "var(--r-md)",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={photoPreview}
                            alt="preview"
                            style={{
                                width: "100%",
                                maxHeight: 280,
                                objectFit: "cover",
                                display: "block",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setPhotoPreview(null);
                                setPhotoFile(null);
                            }}
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                background: "rgba(0,0,0,0.65)",
                                border: "none",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#fff",
                            }}
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Footer actions */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--border)",
                        marginTop: "0.5rem",
                    }}
                >
                    <label
                        className="btn-ghost"
                        htmlFor="photo"
                        style={{ cursor: "pointer", fontSize: "0.85rem" }}
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
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
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ minWidth: 100 }}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span
                                    className="spinner"
                                    style={{ width: 16, height: 16 }}
                                />
                                {isEditMode ? "Saving…" : "Posting…"}
                            </span>
                        ) : isEditMode ? (
                            "Save Changes"
                        ) : (
                            "Post"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostEntry;
