const Avatar = ({ user, size = "md", className = "" }) => {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-24 h-24 text-2xl",
    };

    if (user?.avatar) {
        return (
            <img
                src={`${import.meta.env.VITE_STORAGE_URL}/${user.avatar}`}
                className={`rounded-full object-cover ${sizes[size]} ${className}`}
                alt="avatar"
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
            className={`rounded-full bg-lwsGreen flex items-center justify-center text-deepDark font-bold ${sizes[size]} ${className}`}
        >
            {initials.toUpperCase()}
        </div>
    );
};

export default Avatar;
