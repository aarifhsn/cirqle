import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "../components/common/Avatar";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

/* ── Mock data ────────────────────────────────────────────────── */
const MOCK_JOBS = [
    {
        id: 1,
        title: "React Developer",
        company: "TechBD Ltd",
        location: "Gulshan, Dhaka",
        type: "Full-time",
        salary: "৳40k–60k",
        description:
            "We're looking for a skilled React developer with 2+ years experience. Must know hooks, Redux, and REST APIs.",
        tags: ["React", "JavaScript", "Redux"],
        poster: {
            id: 1,
            firstName: "Arif",
            lastName: "Hossain",
            username: "arifh",
            avatar: null,
        },
        created_at: "2025-06-01",
    },
    {
        id: 2,
        title: "UI/UX Designer",
        company: "Creative Studio",
        location: "Dhanmondi, Dhaka",
        type: "Full-time",
        salary: "৳30k–45k",
        description:
            "Join our creative team. Figma expertise required. Portfolio must be submitted with application.",
        tags: ["Figma", "UI", "UX", "Design"],
        poster: {
            id: 2,
            firstName: "Nadia",
            lastName: "Rahman",
            username: "nadia_r",
            avatar: null,
        },
        created_at: "2025-06-02",
    },
    {
        id: 3,
        title: "Laravel Backend Dev",
        company: "StartupX",
        location: "Remote",
        type: "Remote",
        salary: "৳35k–55k",
        description:
            "Build scalable REST APIs using Laravel. Experience with MySQL and Redis required.",
        tags: ["Laravel", "PHP", "MySQL"],
        poster: {
            id: 3,
            firstName: "Karim",
            lastName: "Uddin",
            username: "karim_u",
            avatar: null,
        },
        created_at: "2025-06-03",
    },
    {
        id: 4,
        title: "Content Writer",
        company: "MediaHouse BD",
        location: "Mirpur, Dhaka",
        type: "Part-time",
        salary: "৳15k–20k",
        description:
            "Write engaging articles, blog posts, and social media content in English and Bengali.",
        tags: ["Writing", "SEO", "Bengali"],
        poster: {
            id: 4,
            firstName: "Sadia",
            lastName: "Islam",
            username: "sadia_i",
            avatar: null,
        },
        created_at: "2025-06-04",
    },
    {
        id: 5,
        title: "Digital Marketing Exec",
        company: "GrowthAgency",
        location: "Uttara, Dhaka",
        type: "Full-time",
        salary: "৳25k–35k",
        description:
            "Run Facebook/Google ad campaigns. Experience with Meta Ads Manager required.",
        tags: ["Marketing", "Facebook Ads", "SEO"],
        poster: {
            id: 5,
            firstName: "Rahim",
            lastName: "Ali",
            username: "rahim_a",
            avatar: null,
        },
        created_at: "2025-06-05",
    },
    {
        id: 6,
        title: "Flutter Developer",
        company: "AppFactory",
        location: "Banani, Dhaka",
        type: "Full-time",
        salary: "৳45k–65k",
        description:
            "Develop cross-platform mobile apps with Flutter. Must have published apps on Play Store / App Store.",
        tags: ["Flutter", "Dart", "Mobile"],
        poster: {
            id: 1,
            firstName: "Arif",
            lastName: "Hossain",
            username: "arifh",
            avatar: null,
        },
        created_at: "2025-06-06",
    },
];

const JOB_TYPES = [
    "All",
    "Full-time",
    "Part-time",
    "Remote",
    "Internship",
    "Freelance",
];
const JOB_CATEGORIES = [
    "All",
    "Tech",
    "Design",
    "Marketing",
    "Writing",
    "Finance",
    "Operations",
    "Other",
];

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ padding: "1.25rem 1.4rem" }}>
                <div className="flex gap-3 mb-3">
                    <div
                        className="skeleton flex-shrink-0"
                        style={{ width: 48, height: 48, borderRadius: 12 }}
                    />
                    <div className="flex-1">
                        <div
                            className="skeleton mb-2"
                            style={{
                                height: 15,
                                width: "50%",
                                borderRadius: 6,
                            }}
                        />
                        <div
                            className="skeleton"
                            style={{
                                height: 12,
                                width: "35%",
                                borderRadius: 6,
                            }}
                        />
                    </div>
                </div>
                <div
                    className="skeleton mb-2"
                    style={{ height: 12, width: "100%", borderRadius: 6 }}
                />
                <div
                    className="skeleton"
                    style={{ height: 12, width: "70%", borderRadius: 6 }}
                />
            </div>
        ))}
    </div>
);

/* ── Job Card ─────────────────────────────────────────────────── */
const JobCard = ({ job, onSelect }) => (
    <div
        className="card card-hover animate-fade-in cursor-pointer"
        style={{ padding: "1.25rem 1.4rem" }}
        onClick={() => onSelect(job)}
    >
        <div className="flex items-start gap-3">
            {/* Company icon */}
            <div
                className="flex-center flex-shrink-0"
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "var(--accent-soft)",
                    fontSize: "1.4rem",
                    border: "1px solid var(--border)",
                    flexShrink: 0,
                }}
            >
                💼
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                        className="font-bold"
                        style={{
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                            fontSize: "0.95rem",
                        }}
                    >
                        {job.title}
                    </h4>
                    <span
                        className="pill flex-shrink-0"
                        style={{
                            fontSize: "0.68rem",
                            background:
                                job.type === "Remote"
                                    ? "var(--success-soft)"
                                    : "var(--accent-soft)",
                            color:
                                job.type === "Remote"
                                    ? "var(--success)"
                                    : "var(--accent)",
                        }}
                    >
                        {job.type}
                    </span>
                </div>

                <p
                    className="text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                >
                    {job.company}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                    <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--text-muted)" }}
                    >
                        📍 {job.location}
                    </span>
                    {job.salary && (
                        <span
                            className="text-xs flex items-center gap-1"
                            style={{ color: "var(--text-muted)" }}
                        >
                            💵 {job.salary}
                        </span>
                    )}
                    <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {new Date(job.created_at).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                </div>

                <p
                    className="text-xs leading-relaxed mb-3"
                    style={{
                        color: "var(--text-secondary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {job.description}
                </p>

                {/* Tags */}
                {job.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag}
                                className="pill pill-muted"
                                style={{ fontSize: "0.68rem" }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div
                    className="flex items-center justify-between pt-2"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <div className="flex items-center gap-2">
                        <Avatar user={job.poster} size="sm" />
                        <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Posted by{" "}
                            <Link
                                to={`/${job.poster?.username}`}
                                className="font-medium transition-colors"
                                style={{ color: "var(--accent)" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {job.poster?.firstName}
                            </Link>
                        </p>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(job);
                        }}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    </div>
);

/* ── Job Detail Modal ─────────────────────────────────────────── */
const JobModal = ({ job, onClose }) => {
    const [applied, setApplied] = useState(false);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "var(--bg-overlay)" }}
        >
            <div
                className="card w-full max-w-lg animate-fade-in-scale"
                style={{
                    padding: "1.75rem",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-start justify-between gap-3 mb-4 pb-4"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex-center flex-shrink-0"
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 12,
                                background: "var(--accent-soft)",
                                fontSize: "1.5rem",
                            }}
                        >
                            💼
                        </div>
                        <div>
                            <h2
                                className="font-bold"
                                style={{
                                    fontSize: "1.1rem",
                                    color: "var(--text-primary)",
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                {job.title}
                            </h2>
                            <p
                                className="text-sm"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {job.company}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon flex-shrink-0"
                    >
                        ✕
                    </button>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { icon: "📍", val: job.location },
                        { icon: "⏱️", val: job.type },
                        ...(job.salary
                            ? [{ icon: "💵", val: job.salary }]
                            : []),
                    ].map((m) => (
                        <span key={m.val} className="pill pill-muted">
                            {m.icon} {m.val}
                        </span>
                    ))}
                </div>

                {/* Description */}
                <div className="mb-4">
                    <h4
                        className="font-semibold mb-2"
                        style={{
                            color: "var(--text-primary)",
                            fontSize: "0.9rem",
                        }}
                    >
                        Job Description
                    </h4>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {job.description}
                    </p>
                </div>

                {/* Tags */}
                {job.tags?.length > 0 && (
                    <div className="mb-5">
                        <h4
                            className="font-semibold mb-2"
                            style={{
                                color: "var(--text-primary)",
                                fontSize: "0.9rem",
                            }}
                        >
                            Skills Required
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {job.tags.map((tag) => (
                                <span key={tag} className="pill pill-accent">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Posted by */}
                <div
                    className="flex items-center gap-3 mb-5 p-3 rounded-xl"
                    style={{
                        background: "var(--bg-surface-2)",
                        border: "1px solid var(--border)",
                    }}
                >
                    <Avatar user={job.poster} size="md" />
                    <div>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {job.poster?.firstName} {job.poster?.lastName}
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                        >
                            Posted this job
                        </p>
                    </div>
                    <Link
                        to={`/${job.poster?.username}`}
                        onClick={onClose}
                        className="btn btn-ghost btn-sm ml-auto"
                    >
                        View Profile
                    </Link>
                </div>

                {/* Apply button */}
                {applied ? (
                    <div
                        className="flex-center gap-2 py-3 rounded-xl"
                        style={{
                            background: "var(--success-soft)",
                            color: "var(--success)",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                        }}
                    >
                        ✅ Application Sent!
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setApplied(true);
                            toast.success("Application sent!");
                        }}
                        className="btn btn-primary w-full"
                        style={{ padding: "0.75rem", fontSize: "0.95rem" }}
                    >
                        Apply Now
                    </button>
                )}
            </div>
        </div>
    );
};

/* ── Post Job Modal ───────────────────────────────────────────── */
const PostJobModal = ({ onClose, onCreated }) => {
    const { api } = useAxios();
    const [form, setForm] = useState({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        tags: "",
    });
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags: form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            };
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/jobs`,
                payload,
            );
            toast.success("Job posted!");
            onCreated(res.data?.data ?? res.data);
        } catch {
            toast.error("Failed to post job.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "var(--bg-overlay)" }}
        >
            <div
                className="card w-full max-w-md animate-fade-in-scale"
                style={{
                    padding: "1.75rem",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
                <div
                    className="flex items-center justify-between mb-5 pb-4"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <h2
                        className="font-bold"
                        style={{
                            fontSize: "1.1rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        💼 Post a Job
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {[
                        {
                            label: "Job Title",
                            key: "title",
                            placeholder: "e.g. React Developer",
                        },
                        {
                            label: "Company",
                            key: "company",
                            placeholder: "Company name",
                        },
                        {
                            label: "Location",
                            key: "location",
                            placeholder: "City or Remote",
                        },
                        {
                            label: "Salary",
                            key: "salary",
                            placeholder: "e.g. ৳40k–60k (optional)",
                        },
                    ].map((f) => (
                        <div key={f.key} className="mb-3">
                            <label
                                className="block text-xs font-semibold mb-1.5"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {f.label}
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder={f.placeholder}
                                required={f.key !== "salary"}
                                value={form[f.key]}
                                onChange={(e) => set(f.key, e.target.value)}
                            />
                        </div>
                    ))}

                    <div className="mb-3">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Job Type
                        </label>
                        <select
                            className="input"
                            value={form.type}
                            onChange={(e) => set("type", e.target.value)}
                        >
                            {JOB_TYPES.filter((t) => t !== "All").map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Description
                        </label>
                        <textarea
                            required
                            className="input"
                            rows={4}
                            style={{ resize: "none" }}
                            placeholder="Describe the role, requirements, responsibilities…"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                        />
                    </div>

                    <div className="mb-5">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Skills (comma separated)
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. React, Node.js, MySQL"
                            value={form.tags}
                            onChange={(e) => set("tags", e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary flex-1"
                        >
                            {saving ? "Posting…" : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── JobsPage ─────────────────────────────────────────────────── */
const JobsPage = () => {
    const { api } = useAxios();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [showPost, setShowPost] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/jobs`)
            .then((r) => setJobs(r.data?.data ?? r.data ?? []))
            .catch(() => setJobs(MOCK_JOBS))
            .finally(() => setLoading(false));
    }, []);

    const filtered = jobs.filter((j) => {
        const matchType = type === "All" || j.type === type;
        const matchSearch =
            `${j.title} ${j.company} ${j.location} ${j.tags?.join(" ")}`
                .toLowerCase()
                .includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: "1.3rem",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        💼 Jobs
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Local opportunities near you
                    </p>
                </div>
                <button
                    onClick={() => setShowPost(true)}
                    className="btn btn-primary btn-sm"
                >
                    + Post a Job
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--text-muted)" }}
                >
                    🔍
                </span>
                <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: "2.25rem" }}
                    placeholder="Search jobs, companies, skills…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Type filter */}
            <div className="flex gap-2 flex-wrap">
                {JOB_TYPES.map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className="btn btn-sm btn-round"
                        style={
                            type === t
                                ? { background: "var(--accent)", color: "#fff" }
                                : {
                                      background: "var(--bg-surface-2)",
                                      color: "var(--text-muted)",
                                      border: "1px solid var(--border)",
                                  }
                        }
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Count */}
            {!loading && filtered.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {filtered.length} jobs found
                </p>
            )}

            {loading && <Skeleton />}

            {!loading && filtered.length === 0 && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
                >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                        💼
                    </span>
                    <h3
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        No jobs found
                    </h3>
                    <p
                        className="text-sm mb-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Try different filters or post a new job.
                    </p>
                    <button
                        onClick={() => setShowPost(true)}
                        className="btn btn-primary btn-sm"
                    >
                        Post a Job
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                    {filtered.map((j) => (
                        <JobCard key={j.id} job={j} onSelect={setSelectedJob} />
                    ))}
                </div>
            )}

            {selectedJob && (
                <JobModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                />
            )}
            {showPost && (
                <PostJobModal
                    onClose={() => setShowPost(false)}
                    onCreated={(j) => {
                        setJobs((prev) => [j, ...prev]);
                        setShowPost(false);
                    }}
                />
            )}
        </AppLayout>
    );
};

export default JobsPage;
