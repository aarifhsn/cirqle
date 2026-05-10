/* LoginPage.jsx — Cirqle v2
 * Changes:
 * - badge badge-accent → .pill.pill-accent
 * - All CSS vars already in use — no hardcoded colors
 * - Layout/branding untouched
 */

import { Link } from "react-router-dom";
import AuthIllustration from "../assets/images/auth_illustration.png";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
    return (
        <main className="auth-bg flex min-h-screen items-center justify-center py-8 px-4">
            <div className="w-full max-w-5xl">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* ── Left: Branding (desktop only) ─────────── */}
                    <div className="hidden lg:flex flex-col justify-center">
                        <img
                            className="mb-10 max-w-xs opacity-90"
                            src={AuthIllustration}
                            alt="Cirqle illustration"
                        />
                        <h1
                            className="mb-3 font-bold leading-tight"
                            style={{
                                fontSize: "3rem",
                                color: "var(--text-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            Welcome back
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
                            Share your thoughts, connect with people nearby, and
                            discover what's happening around you.
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {[
                                "Posts & Reactions",
                                "Follow People",
                                "Local Circles",
                            ].map((f) => (
                                <span key={f} className="pill pill-accent">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Form card ──────────────────────── */}
                    <div>
                        <div
                            className="card animate-fade-in"
                            style={{ padding: "2rem" }}
                        >
                            <div className="mb-6">
                                {/* Mobile logo */}
                                <p
                                    className="lg:hidden font-bold mb-1"
                                    style={{
                                        fontSize: "1.5rem",
                                        color: "var(--text-primary)",
                                        fontFamily: "var(--font-display)",
                                    }}
                                >
                                    Cirqle
                                    <span style={{ color: "var(--accent)" }}>
                                        .
                                    </span>
                                </p>
                                <h2
                                    className="font-bold"
                                    style={{
                                        fontSize: "1.4rem",
                                        color: "var(--text-primary)",
                                        fontFamily: "var(--font-display)",
                                    }}
                                >
                                    Sign in
                                </h2>
                                <p
                                    className="text-sm mt-0.5"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Good to see you again
                                </p>
                            </div>

                            <LoginForm />

                            <p
                                className="mt-5 text-center text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold hover:underline"
                                    style={{ color: "var(--accent)" }}
                                >
                                    Create one free
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;
