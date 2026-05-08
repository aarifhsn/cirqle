import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageLayout from "../components/common/PageLayout";
import UserCard from "../components/common/UseCard";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const FollowingPage = () => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();

    useEffect(() => {
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/${username}/following`)
            .then((r) => {
                setFollowing(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

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
                            Following
                        </h1>
                        <p className="text-xs text-gray-500">
                            People{" "}
                            {username === auth?.user?.username
                                ? "you"
                                : username}{" "}
                            follows
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
                {!loading && following.length === 0 && (
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
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </div>
                        <p className="text-white font-semibold mb-1">
                            Not following anyone
                        </p>
                        <p className="text-gray-500 text-sm">
                            Find people to follow
                        </p>
                        <Link
                            to="/"
                            className="mt-4 px-4 py-2 rounded-md bg-lwsGreen text-deepDark text-sm font-bold hover:opacity-90 transition-all"
                        >
                            Explore Feed
                        </Link>
                    </div>
                )}

                {/* List */}
                {!loading && following.length > 0 && (
                    <div className="space-y-2">
                        {following.map((person) => (
                            <UserCard key={person.id} person={person} />
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default FollowingPage;
