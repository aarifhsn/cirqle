const Avatar = ({ user, size = "md", className = "" }) => {
    const sizes = {
        sm: { px: 32, text: "0.75rem" },
        md: { px: 40, text: "0.875rem" },
        lg: { px: 96, text: "1.75rem" },
        xl: { px: 128, text: "2.25rem" },
    };

    const s = sizes[size] || sizes.md;

    const style = {
        width: s.px,
        height: s.px,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
    };

    if (user?.avatar) {
        return (
            <img
                src={`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}
                style={style}
                className={className}
                alt={user?.firstName || "avatar"}
            />
        );
    }

    let initials = "";
    if (user?.firstName || user?.lastName) {
        initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
    } else if (user?.name) {
        const parts = user.name.trim().split(" ");
        initials =
            (parts[0]?.[0] || "") + (parts.length > 1 ? parts[1]?.[0] : "");
    }

    return (
        <div
            style={{
                ...style,
                background: "var(--accent-soft)",
                border: "1px solid rgba(0,217,145,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: s.text,
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "0.05em",
                userSelect: "none",
            }}
            className={className}
        >
            {initials.toUpperCase() || "?"}
        </div>
    );
};

export default Avatar;
