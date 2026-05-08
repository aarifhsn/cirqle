/**
 * PrivacyIcon — shows a small inline badge for post privacy level.
 * Purely visual, no logic changes.
 */
const PrivacyIcon = ({ privacy }) => {
    const map = {
        public: {
            icon: "🌐",
            label: "Public",
            color: "rgba(0,217,145,0.15)",
            text: "var(--accent)",
        },
        followers: {
            icon: "👥",
            label: "Followers",
            color: "rgba(99,102,241,0.15)",
            text: "#818cf8",
        },
        only_me: {
            icon: "🔒",
            label: "Only Me",
            color: "rgba(245,158,11,0.15)",
            text: "#fbbf24",
        },
    };

    const config = map[privacy] ?? map.public;

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
                padding: "0.1rem 0.45rem",
                borderRadius: "var(--r-full)",
                background: config.color,
                color: config.text,
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                lineHeight: 1.6,
                userSelect: "none",
                flexShrink: 0,
            }}
            title={config.label}
        >
            <span style={{ fontSize: "0.6rem" }}>{config.icon}</span>
            {config.label}
        </span>
    );
};

export default PrivacyIcon;
