// Bio.jsx
import { useProfile } from "../../hooks/useProfile";

const Bio = ({ isMe }) => {
    const { state } = useProfile();
    const { user } = state;

    if (!user?.bio && !isMe) return null;

    return (
        <div style={{ marginBottom: "0.5rem" }}>
            <p
                style={{
                    fontSize: "0.9rem",
                    color: user?.bio
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    lineHeight: 1.6,
                    fontStyle: !user?.bio ? "italic" : "normal",
                }}
            >
                {user?.bio || "No bio yet."}
            </p>
        </div>
    );
};

export default Bio;
