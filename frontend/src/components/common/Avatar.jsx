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

    // check avatar is a valid non-empty string
    const hasAvatar =
        user?.avatar && user.avatar.trim() !== "" && user.avatar !== "null";

    const avatarSrc = hasAvatar
        ? user.avatar.startsWith("http")
            ? user.avatar
            : `${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`
        : null;

    // derive initials from firstName/lastName or full name string
    const getInitials = () => {
        if (user?.firstName || user?.lastName) {
            return `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;
        }
        if (user?.name) {
            const parts = user.name.trim().split(" ");
            return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
        }
        return "";
    };

    if (hasAvatar) {
        return (
            <img
                src={avatarSrc}
                style={style}
                className={className}
                alt={user?.firstName || user?.name || "avatar"}
                onError={(e) => {
                    // if image fails to load, swap to initials div
                    e.target.style.display = "none";
                    e.target.nextSibling?.style.removeProperty("display");
                }}
            />
        );
    }

    const initials = getInitials();

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
