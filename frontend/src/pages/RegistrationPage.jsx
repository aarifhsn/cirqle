/* RegistrationPage.jsx — Cirqle v2
 * Changes:
 * - badge badge-accent → .pill.pill-accent
 * - font-display class → fontFamily CSS var
 * - All CSS vars already in use — no hardcoded colors
 */

import { Link } from "react-router-dom";
import RegistrationLogo from "../assets/icons/registration.svg";
import RegistrationForm from "../components/auth/RegistrationForm";

const RegistrationPage = () => {
    return (
        <main className="auth-bg flex min-h-screen items-center justify-center py-8 px-4">
            <div className="w-full max-w-5xl">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* ── Left: Branding ────────────────────────── */}
                    <div className="hidden lg:flex flex-col justify-center">
                        <img
                            className="mb-10 h-52 object-contain opacity-90"
                            src={RegistrationLogo}
                            alt="Registration"
                        />
                        <h1
                            className="mb-3 font-bold leading-tight"
                            style={{
                                fontSize: "3rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            Join Cirqle
                            <span style={{ color: "var(--accent)" }}>.</span>
                        </h1>
                        <p
                            className="mb-6"
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "1.05rem",
                                maxWidth: 380,
                                lineHeight: 1.7,
                            }}
                        >
                            Create your profile, post updates, connect with your
                            neighborhood, and be part of something real.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {["Free Forever", "No Ads", "Privacy First"].map(
                                (f) => (
                                    <span key={f} className="pill pill-accent">
                                        {f}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>

                    {/* ── Right: Form card ──────────────────────── */}
                    <div>
                        <div
                            className="card animate-fade-in"
                            style={{ padding: "2rem" }}
                        >
                            {/* Mobile branding */}
                            <div className="lg:hidden mb-6">
                                <h1
                                    className="font-bold"
                                    style={{
                                        fontSize: "1.75rem",
                                        color: "var(--text-primary)",
                                        fontFamily: "var(--font-display)",
                                    }}
                                >
                                    Cirqle
                                    <span style={{ color: "var(--accent)" }}>
                                        .
                                    </span>
                                </h1>
                                <p
                                    className="text-sm mt-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Create your account
                                </p>
                            </div>

                            {/* Desktop heading */}
                            <div className="hidden lg:block mb-6">
                                <h2
                                    className="font-bold"
                                    style={{
                                        fontSize: "1.4rem",
                                        color: "var(--text-primary)",
                                        fontFamily: "var(--font-display)",
                                    }}
                                >
                                    Create account
                                </h2>
                                <p
                                    className="text-sm mt-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    It's quick and free
                                </p>
                            </div>

                            <RegistrationForm />

                            <p
                                className="mt-5 text-center text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold hover:underline"
                                    style={{ color: "var(--accent)" }}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default RegistrationPage;
