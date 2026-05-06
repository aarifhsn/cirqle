import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export const useAvatar = (post) => {
    const { state } = useProfile();
    const { auth } = useAuth();

    const loggedInUser = state?.user ?? auth?.user;
    const isMe = post?.author?.id === loggedInUser?.id;

    // use latest profile avatar if it's my post, otherwise use post author avatar
    const avatar = isMe ? loggedInUser?.avatar : post?.author?.avatar;
    const avatarURL = `${import.meta.env.VITE_STORAGE_URL}/${avatar}`;

    return { avatarURL };
};
