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
    const { state: profile, dispatch: profileDispatch } = useProfile();
    const { api } = useAxios();
    const user = profile?.user ?? auth?.user;
    const isEditMode = !!postToEdit;

    const [photoFiles, setPhotoFiles] = useState(
        postToEdit?.images?.map((img) => ({
            existing: true,
            id: img.id,
            preview: `${import.meta.env.VITE_STORAGE_URL}/${img.image}`,
        })) ?? [],
    );
    const [removedImages, setRemovedImages] = useState([]);

    /* ── Original form logic untouched ───────────────────────── */
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
        const files = Array.from(e.target.files);
        const remaining = 5 - photoFiles.length;
        const toAdd = files.slice(0, remaining).map((file) => ({
            existing: false,
            file,
            preview: URL.createObjectURL(file),
        }));
        setPhotoFiles((prev) => [...prev, ...toAdd]);
    };

    const removePhoto = (index) => {
        const item = photoFiles[index];
        if (item.existing) setRemovedImages((prev) => [...prev, item.id]);
        setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePostSubmit = async (formData) => {
        dispatch({ type: actions.post.DATA_FETCHING });
        try {
            const data = new FormData();
            data.append("content", formData.content);
            data.append("privacy", formData.privacy);
            photoFiles
                .filter((p) => !p.existing)
                .forEach((p) => data.append("images[]", p.file));
            removedImages.forEach((id) => data.append("removed_images[]", id));

            let response;
            if (isEditMode) {
                data.append("_method", "PATCH");
                response = await api.post(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/posts/${postToEdit.id}`,
                    data,
                    { headers: { "Content-Type": "multipart/form-data" } },
                );
                if (response.status === 200) {
                    dispatch({
                        type: actions.post.DATA_EDITED,
                        data: response.data,
                    });
                    // ← also update profile context
                    profileDispatch({
                        type: actions.profile.POST_UPDATED,
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
                if (response.status === 200 || response.status === 201) {
                    dispatch({
                        type: actions.post.DATA_CREATED,
                        data: response.data,
                    });
                    // ← also update profile context
                    profileDispatch({
                        type: actions.profile.POST_CREATED,
                        data: response.data,
                    });
                    toast.success("Post created!");
                }
            }
            onCreate();
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Something went wrong!",
            );
            dispatch({
                type: actions.post.DATA_FETCH_ERROR,
                error: error.message,
            });
        }
    };

    const gridCols =
        photoFiles.length === 1
            ? "grid-cols-1"
            : photoFiles.length === 2
              ? "grid-cols-2"
              : "grid-cols-3";

    return (
        <div
            className="card relative max-h-[90vh] overflow-y-auto"
            style={{ padding: "1.5rem" }}
        >
            {/* ── Header ────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between mb-5 pb-4"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <h3
                    className="font-bold"
                    style={{
                        fontSize: "1.1rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {isEditMode ? "✏️ Edit Post" : "✨ Create Post"}
                </h3>
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-icon"
                    aria-label="Close"
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
                {/* ── Author row ────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-4">
                    <Avatar user={user} size="md" />
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <span
                                className="font-semibold text-sm"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {user?.firstName} {user?.lastName}
                            </span>
                            <PrivacyIcon privacy={watch("privacy")} />
                        </div>
                        {/* Privacy select */}
                        <select
                            {...register("privacy", {
                                required: "Privacy setting is required!",
                            })}
                            className="text-xs px-2 py-1 rounded-lg outline-none cursor-pointer transition-all"
                            style={{
                                background: "var(--input-bg)",
                                border: "1.5px solid var(--border)",
                                color: "var(--text-secondary)",
                            }}
                            onFocus={(e) =>
                                (e.currentTarget.style.borderColor =
                                    "var(--accent)")
                            }
                            onBlur={(e) =>
                                (e.currentTarget.style.borderColor =
                                    "var(--border)")
                            }
                        >
                            <option value="public">🌐 Public</option>
                            <option value="followers">👥 Followers</option>
                            <option value="only_me">🔒 Only Me</option>
                        </select>
                    </div>
                </div>

                {/* ── Textarea ──────────────────────────────────── */}
                <Field label="" error={errors.content}>
                    <textarea
                        {...register("content", {
                            required: "Please add some text!",
                        })}
                        id="content"
                        placeholder="Share something with your circle…"
                        className="w-full min-h-[120px] bg-transparent border-none outline-none resize-none text-sm leading-relaxed"
                        style={{
                            color: "var(--text-primary)",
                            caretColor: "var(--accent)",
                        }}
                    />
                </Field>

                {/* ── Image previews ────────────────────────────── */}
                {photoFiles.length > 0 && (
                    <>
                        <div className={`grid ${gridCols} gap-2 mb-2`}>
                            {photoFiles.map((photo, index) => (
                                <div
                                    key={index}
                                    className="relative aspect-square rounded-xl overflow-hidden group"
                                >
                                    <img
                                        src={photo.preview}
                                        className="w-full h-full object-cover"
                                        alt={`preview ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-white text-xs flex-center opacity-0 group-hover:opacity-100 transition-all"
                                        style={{
                                            background: "rgba(0,0,0,0.65)",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add more */}
                        {photoFiles.length < 5 && (
                            <label
                                className="flex items-center gap-1.5 text-xs mb-3 w-fit cursor-pointer transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--accent)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                        "var(--text-muted)")
                                }
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
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Add more ({photoFiles.length}/5)
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        )}
                    </>
                )}

                {/* ── Footer ────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between pt-4 mt-2"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    {/* Photo upload trigger */}
                    <label
                        htmlFor="photo-upload"
                        className="flex items-center gap-2 text-sm cursor-pointer transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "var(--accent)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--text-muted)")
                        }
                    >
                        <svg
                            className="w-5 h-5"
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
                        {photoFiles.length > 0
                            ? `${photoFiles.length} / 5 photos`
                            : "Add Photos"}
                    </label>
                    <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handlePhotoChange}
                    />

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                        style={{ minWidth: 100 }}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    />
                                </svg>
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
