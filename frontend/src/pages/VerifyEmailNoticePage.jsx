import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import useAxios from "../hooks/useAxios";

const VerifyEmailNoticePage = () => {
    const { api } = useAxios();
    const { auth } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

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
        <div className="min-h-screen bg-deepDark flex items-center justify-center px-4">
            <div className="card max-w-md w-full text-center p-8">
                <div className="w-16 h-16 rounded-full bg-lwsGreen/10 flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-lwsGreen"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                <h1 className="text-xl font-bold text-white mb-2">
                    Verify your email
                </h1>
                <p className="text-gray-400 text-sm mb-1">
                    We sent a verification link to
                </p>
                <p className="text-lwsGreen text-sm font-medium mb-6">
                    {auth?.user?.email}
                </p>

                <p className="text-gray-500 text-xs mb-6">
                    Click the link in the email to verify your account. Check
                    your spam folder if you don't see it.
                </p>

                <button
                    onClick={handleResend}
                    disabled={sending || sent}
                    className="w-full py-2.5 rounded-md bg-lwsGreen text-deepDark font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {sending
                        ? "Sending..."
                        : sent
                          ? "Email Sent ✓"
                          : "Resend Verification Email"}
                </button>
            </div>
        </div>
    );
};

export default VerifyEmailNoticePage;
