/* Avatar.jsx — Cirqle v2
 * Changes:
 * - Initials fallback border: hardcoded rgba(0,217,145,0.25) → var(--border)
 * - background: var(--accent-soft) (already was, kept)
 * - color: var(--accent) (already was, kept)
 * - All logic (hasAvatar, getInitials, onError) 100% untouched
 */

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

    const hasAvatar =
        user?.avatar && user.avatar.trim() !== "" && user.avatar !== "null";

    const avatarSrc = hasAvatar
        ? user.avatar.startsWith("http")
            ? user.avatar
            : `${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`
        : null;

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
                border: "1px solid var(--border)" /* ← fixed: was hardcoded rgba green */,
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
