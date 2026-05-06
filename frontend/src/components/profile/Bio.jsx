import { useProfile } from "../../hooks/useProfile";

const Bio = ({ isMe }) => {
    // show only bio
    const { state } = useProfile();
    const { user } = state;

    return (
        <div className="mb-4">
            <p className="text-gray-500">{user?.bio ?? "No bio yet."}</p>
        </div>
    );
};

export default Bio;
