export const getDateDifferenceFromNow = (fromDate) => {
    const now = new Date().getTime();
    const past = new Date(fromDate).getTime();

    const difference = Math.floor((now - past) / 1000); // seconds

    const days = Math.floor(difference / 86400);
    const hours = Math.floor(difference / 3600);
    const minutes = Math.floor(difference / 60);

    if (difference < 60) {
        return "Just now";
    }

    if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
};

// Add this helper inline or in utils.js
export const getAvatarSrc = (author, authUser, profileUser) => {
    const isMe = author?.id === authUser?.id;
    const avatar = isMe
        ? (profileUser?.avatar ?? authUser?.avatar)
        : author?.avatar;
    return avatar ? `${import.meta.env.VITE_STORAGE_URL}/${avatar}` : null;
};
