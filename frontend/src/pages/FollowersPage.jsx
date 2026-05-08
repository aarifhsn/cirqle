import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageLayout from "../components/common/PageLayout";
import UserCard from "../components/common/UseCard";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const FollowersPage = () => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/${username}/followers`)
            .then((r) => {
                setFollowers(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    console.log(followers);

    return (
        <PageLayout>
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        to={`/${username}`}
                        className="w-8 h-8 rounded-full bg-lighterDark flex items-center justify-center hover:bg-[#3F3F3F] transition-all"
                    >
                        <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            Followers
                        </h1>
                        <p className="text-xs text-gray-500">
                            {auth?.user?.username === username
                                ? "People who follow you"
                                : `People who follow ${username}`}
                        </p>
                    </div>
                </div>

                {/* Skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="card flex items-center gap-3 p-4"
                            >
                                <div className="w-11 h-11 rounded-full bg-lighterDark animate-pulse shrink-0" />
                                <div className="flex-1">
                                    <div className="h-3 w-32 bg-lighterDark rounded animate-pulse mb-2" />
                                    <div className="h-2.5 w-20 bg-lighterDark rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && followers.length === 0 && (
                    <div className="card flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-full bg-lwsGreen/10 flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-lwsGreen"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-white font-semibold mb-1">
                            No followers yet
                        </p>
                        <p className="text-gray-500 text-sm">
                            Share your profile to get followers
                        </p>
                    </div>
                )}

                {/* List */}
                {!loading && followers.length > 0 && (
                    <div className="space-y-2">
                        {followers.map((person) => (
                            <UserCard key={person.id} person={person} />
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default FollowersPage;
