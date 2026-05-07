import { Link } from "react-router-dom";
import AuthIllustration from "../assets/images/auth_illustration.png";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
    return (
        <main className="auth-bg flex min-h-screen items-center justify-center py-8 px-4">
            <div className="w-full max-w-5xl">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* ── Left: Branding (desktop only) ── */}
                    <div className="hidden lg:flex flex-col justify-center">
                        <img
                            className="mb-10 max-w-xs opacity-90"
                            src={AuthIllustration}
                            alt="Cirqle illustration"
                        />
                        <h1
                            className="font-display mb-3 text-5xl font-bold leading-tight"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Welcome back
                            <span style={{ color: "var(--accent)" }}>.</span>
                        </h1>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "1.05rem",
                                maxWidth: "380px",
                                lineHeight: 1.7,
                            }}
                        >
                            Share your thoughts, connect with people you care
                            about, and discover what's happening around you.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-6">
                            {[
                                "Posts & Reactions",
                                "Follow People",
                                "Private Messaging",
                            ].map((f) => (
                                <span key={f} className="badge badge-accent">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Form card ── */}
                    <div>
                        <div className="card" style={{ padding: "2rem" }}>
                            {/* Unified header — works at all breakpoints */}
                            <div className="mb-6">
                                {/* Logo shown on mobile, hidden on desktop (desktop has left-panel branding) */}
                                <p
                                    className="lg:hidden font-display text-2xl font-bold mb-1"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Cirqle
                                    <span style={{ color: "var(--accent)" }}>
                                        .
                                    </span>
                                </p>
                                <h2
                                    style={{
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    Sign in
                                </h2>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.875rem",
                                        marginTop: "0.2rem",
                                    }}
                                >
                                    Good to see you again
                                </p>
                            </div>

                            <LoginForm />

                            <p
                                className="mt-5 text-center"
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    style={{
                                        color: "var(--accent)",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                    }}
                                    className="hover:underline transition-all"
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
