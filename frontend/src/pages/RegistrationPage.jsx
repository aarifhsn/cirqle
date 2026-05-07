import { Link } from "react-router-dom";
import RegistrationLogo from "../assets/icons/registration.svg";
import RegistrationForm from "../components/auth/RegistrationForm";

const RegistrationPage = () => {
    return (
        <main className="auth-bg flex min-h-screen items-center justify-center py-8 px-4">
            <div className="w-full max-w-5xl">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* ── Left: Branding ── */}
                    <div className="hidden lg:flex flex-col justify-center">
                        <img
                            className="mb-10 h-52 object-contain opacity-90"
                            src={RegistrationLogo}
                            alt="Registration"
                        />
                        <h1
                            className="font-display mb-3 text-5xl font-bold leading-tight"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Join Cirqle
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
                            Create your profile, post updates, follow friends,
                            and be part of something meaningful.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-6">
                            {["Free Forever", "No Ads", "Privacy First"].map(
                                (f) => (
                                    <span
                                        key={f}
                                        className="badge badge-accent"
                                    >
                                        {f}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>

                    {/* ── Right: Form card ── */}
                    <div>
                        <div className="card" style={{ padding: "2rem 2rem" }}>
                            {/* Mobile branding */}
                            <div className="lg:hidden mb-6">
                                <h1
                                    className="font-display text-3xl font-bold"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Cirqle
                                    <span style={{ color: "var(--accent)" }}>
                                        .
                                    </span>
                                </h1>
                                <p
                                    style={{
                                        color: "var(--text-secondary)",
                                        fontSize: "0.9rem",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    Create your account
                                </p>
                            </div>

                            <div className="hidden lg:block mb-6">
                                <h2
                                    style={{
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    Create account
                                </h2>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.875rem",
                                        marginTop: "0.2rem",
                                    }}
                                >
                                    It's quick and free
                                </p>
                            </div>

                            <RegistrationForm />

                            <p
                                className="mt-5 text-center"
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--text-muted)",
                                }}
                            >
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    style={{
                                        color: "var(--accent)",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                    }}
                                    className="hover:underline transition-all"
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
