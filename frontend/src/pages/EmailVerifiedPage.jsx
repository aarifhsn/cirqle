import { Link, useSearchParams } from "react-router-dom";

const EmailVerifiedPage = () => {
    const [params] = useSearchParams();
    const verified = params.get("verified") === "true";
    const already = params.get("already") === "true";

    return (
        <div className="min-h-screen bg-deepDark flex items-center justify-center px-4">
            <div className="card max-w-md w-full text-center p-8">
                <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${verified ? "bg-lwsGreen/20" : "bg-yellow-500/20"}`}
                >
                    {verified ? (
                        <svg
                            className="w-8 h-8 text-lwsGreen"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-8 h-8 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
                            />
                        </svg>
                    )}
                </div>

                <h1 className="text-xl font-bold text-white mb-2">
                    {verified
                        ? "Email Verified!"
                        : already
                          ? "Already Verified"
                          : "Verification Failed"}
                </h1>
                <p className="text-gray-400 text-sm mb-6">
                    {verified
                        ? "Your email has been verified. You can now access all features."
                        : already
                          ? "Your email was already verified."
                          : "The verification link is invalid or expired."}
                </p>

                <Link
                    to="/"
                    className="inline-block px-6 py-2.5 rounded-md bg-lwsGreen text-deepDark font-bold text-sm hover:opacity-90 transition-all"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default EmailVerifiedPage;
