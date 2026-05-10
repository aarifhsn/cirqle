/* VerifyEmailNoticePage.jsx — Cirqle v2
 * Changes:
 * - bg-deepDark → var(--bg-base)
 * - bg-lwsGreen/10, text-lwsGreen → CSS vars
 * - text-white → var(--text-primary)
 * - text-gray-400, text-gray-500 → var(--text-muted)
 * - bg-lwsGreen text-deepDark → .btn.btn-primary
 * - All resend API logic 100% untouched
 */

import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const VerifyEmailNoticePage = () => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    /* ── Original logic untouched ────────────────────────────── */
    const handleResend = async () => {
        setSending(true);
        try {
            await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/auth/email/resend`,
            );
            setSent(true);
            toast.success("Verification email sent!");
        } catch (e) {
            toast.error(e.response?.data?.message ?? "Failed to resend");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="auth-bg min-h-screen flex items-center justify-center px-4">
            <div
                className="card w-full text-center animate-fade-in-scale"
                style={{ maxWidth: 420, padding: "2.5rem 2rem" }}
            >
                {/* Icon */}
                <div
                    className="flex-center mx-auto mb-5"
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "var(--accent-soft)",
                    }}
                >
                    <span style={{ fontSize: "1.75rem" }}>📧</span>
                </div>

                <h1
                    className="font-bold mb-2"
                    style={{
                        fontSize: "1.25rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-display)",
                    }}
                >
                    Verify your email
                </h1>

                <p
                    className="text-sm mb-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    We sent a verification link to
                </p>
                <p
                    className="text-sm font-semibold mb-5"
                    style={{ color: "var(--accent)" }}
                >
                    {auth?.user?.email}
                </p>

                <p
                    className="text-xs mb-6"
                    style={{ color: "var(--text-muted)", lineHeight: 1.7 }}
                >
                    Click the link in the email to verify your account. Check
                    your spam folder if you don't see it.
                </p>

                <button
                    onClick={handleResend}
                    disabled={sending || sent}
                    className="btn btn-primary w-full"
                    style={{ padding: "0.75rem" }}
                >
                    {sending ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                            Sending…
                        </span>
                    ) : sent ? (
                        "✓ Email Sent"
                    ) : (
                        "Resend Verification Email"
                    )}
                </button>
            </div>
        </div>
    );
};

export default VerifyEmailNoticePage;
