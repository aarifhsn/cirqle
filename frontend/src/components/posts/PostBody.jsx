// PostBody.jsx
export const PostBody = ({ poster, content }) => {
    return (
        <div style={{ marginBottom: "0.25rem" }}>
            {content && (
                <p
                    style={{
                        fontSize: "0.95rem",
                        lineHeight: 1.65,
                        color: "var(--text-primary)",
                        marginBottom: poster ? "0.75rem" : 0,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {content}
                </p>
            )}
            {poster && (
                <div
                    style={{
                        borderRadius: "var(--r-md)",
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        marginTop: content ? "0.75rem" : 0,
                    }}
                >
                    <img
                        src={`${import.meta.env.VITE_STORAGE_URL}/${poster}`}
                        alt="post image"
                        style={{
                            width: "100%",
                            maxHeight: 480,
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default PostBody;
