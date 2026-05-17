import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "../common/Avatar";

const CreateCirclePost = ({ circleId, onCreated }) => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const user = auth?.user;
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/posts`,
                { content, circle_id: circleId, privacy: "circles" },
            );
            onCreated(res.data?.data ?? res.data);
            setContent("");
            toast.success("Post created!");
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to post.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card mb-3" style={{ padding: "1rem 1.25rem" }}>
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <Avatar user={user} size="md" />
                </div>
                <div className="flex-1">
                    <textarea
                        className="input"
                        rows={2}
                        style={{ resize: "none", marginBottom: "0.75rem" }}
                        placeholder={`Share something with this circle…`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={saving || !content.trim()}
                            className="btn btn-primary btn-sm"
                        >
                            {saving ? "Posting…" : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateCirclePost;
