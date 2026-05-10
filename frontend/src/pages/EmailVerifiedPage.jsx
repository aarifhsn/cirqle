/* EmailVerifiedPage.jsx — Cirqle v2
 * Changes:
 * - bg-deepDark → var(--bg-base) via .auth-bg
 * - bg-lwsGreen/20, text-lwsGreen → CSS vars
 * - bg-yellow-500/20, text-yellow-400 → CSS warning vars
 * - text-white → var(--text-primary)
 * - text-gray-400 → var(--text-muted)
 * - bg-lwsGreen text-deepDark → .btn.btn-primary
 * - All params logic untouched
 */

import { Link, useSearchParams } from "react-router-dom";

const EmailVerifiedPage = () => {
    const [params] = useSearchParams();
    const verified = params.get("verified") === "true";
    const already = params.get("already") === "true";

    const isSuccess = verified;
    const isWarning = !verified && already;

    return (
        <div className="auth-bg min-h-screen flex items-center justify-center px-4">
            <div
                className="card w-full text-center animate-fade-in-scale"
                style={{ maxWidth: 420, padding: "2.5rem 2rem" }}
            >
                {/* Status icon */}
                <div
                    className="flex-center mx-auto mb-5"
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: isSuccess
                            ? "var(--success-soft)"
                            : isWarning
                              ? "var(--warning-soft)"
                              : "var(--danger-soft)",
                    }}
                >
                    <span style={{ fontSize: "1.75rem" }}>
                        {isSuccess ? "✅" : isWarning ? "⚠️" : "❌"}
                    </span>
                </div>

                <h1
                    className="font-bold mb-2"
                    style={{
                        fontSize: "1.25rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    {verified
                        ? "Email Verified!"
                        : already
                          ? "Already Verified"
                          : "Verification Failed"}
                </h1>

                <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
                >
                    {verified
                        ? "Your email has been verified. You can now access all features."
                        : already
                          ? "Your email was already verified. You're good to go."
                          : "The verification link is invalid or expired. Please request a new one."}
                </p>

                {verified || already ? (
                    <Link
                        to="/"
                        className="btn btn-primary w-full"
                        style={{ padding: "0.75rem" }}
                    >
                        Go to Home
                    </Link>
                ) : (
                    <Link
                        to="/forgot-password"
                        className="btn btn-ghost w-full"
                        style={{ padding: "0.75rem" }}
                    >
                        Request New Link
                    </Link>
                )}
            </div>
        </div>
    );
};

export default EmailVerifiedPage;
