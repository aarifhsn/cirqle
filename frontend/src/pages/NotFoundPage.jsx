import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-deepDark flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* 404 graphic */}
                <div className="relative mb-8">
                    <p className="text-[8rem] font-black text-lwsGreen/10 leading-none select-none">
                        404
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-lwsGreen/10 flex items-center justify-center">
                            <svg
                                className="w-9 h-9 text-lwsGreen"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    Page not found
                </h1>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-lighterDark text-gray-300 text-sm font-medium hover:bg-[#3F3F3F] transition-all"
                    >
                        <svg
                            className="w-4 h-4"
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
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-lwsGreen text-deepDark text-sm font-bold hover:opacity-90 transition-all"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-5.25h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z"
                            />
                        </svg>
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
