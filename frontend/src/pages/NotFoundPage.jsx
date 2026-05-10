/* NotFoundPage.jsx — Cirqle v2
 * Changes:
 * - bg-deepDark → var(--bg-base) via body (already set)
 * - text-lwsGreen/10, bg-lwsGreen/10, text-lwsGreen → CSS vars
 * - bg-lighterDark → var(--bg-surface-2)
 * - text-white → var(--text-primary)
 * - text-gray-500 → var(--text-muted)
 * - bg-lwsGreen text-deepDark → .btn.btn-primary
 */

import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "var(--bg-base)" }}
        >
            <div className="text-center max-w-md animate-fade-in">
                {/* 404 graphic */}
                <div className="relative mb-8">
                    <p
                        className="font-black leading-none select-none"
                        style={{
                            fontSize: "8rem",
                            color: "var(--accent-soft-2)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        404
                    </p>
                    <div className="absolute inset-0 flex-center">
                        <div
                            className="flex-center"
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "var(--accent-soft)",
                            }}
                        >
                            <span style={{ fontSize: "2rem" }}>😕</span>
                        </div>
                    </div>
                </div>

                <h1
                    className="font-bold mb-2"
                    style={{
                        fontSize: "1.5rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    Page not found
                </h1>
                <p
                    className="text-sm mb-8 leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                >
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-ghost"
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
                    <Link to="/" className="btn btn-primary">
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
