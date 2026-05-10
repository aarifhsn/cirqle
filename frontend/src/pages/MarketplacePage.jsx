import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "../components/common/Avatar";
import useAxios from "../hooks/useAxios";
import AppLayout from "../layouts/AppLayout";

/* ── Mock data ────────────────────────────────────────────────── */
const MOCK_LISTINGS = [
    {
        id: 1,
        title: "iPhone 13 Pro",
        price: 65000,
        category: "Electronics",
        location: "Gulshan, Dhaka",
        description:
            "Excellent condition, 128GB, Pacific Blue. Minor scratches on back.",
        images: [],
        status: "active",
        user: {
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
        title: "Study Table & Chair",
        price: 4500,
        category: "Furniture",
        location: "Mirpur, Dhaka",
        description: "Solid wood study table with matching chair. 2 years old.",
        images: [],
        status: "active",
        user: {
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
        title: 'Samsung 32" Monitor',
        price: 12000,
        category: "Electronics",
        location: "Dhanmondi, Dhaka",
        description: "Full HD IPS panel, HDMI+VGA, works perfectly.",
        images: [],
        status: "active",
        user: {
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
        title: "Bicycle — Hero Sprint",
        price: 8000,
        category: "Sports",
        location: "Uttara, Dhaka",
        description:
            "21-speed mountain bike. Good condition, needs minor tune-up.",
        images: [],
        status: "active",
        user: {
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
        title: "Books — HSC 2024 Set",
        price: 600,
        category: "Books",
        location: "Mohammadpur, Dhaka",
        description: "Complete HSC science group books. Used one year.",
        images: [],
        status: "active",
        user: {
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
        title: "Air Cooler",
        price: 5500,
        category: "Home",
        location: "Banani, Dhaka",
        description:
            "Symphony Ninja cooler, 3-speed, used 1 season. With warranty card.",
        images: [],
        status: "active",
        user: {
            id: 1,
            firstName: "Arif",
            lastName: "Hossain",
            username: "arifh",
            avatar: null,
        },
        created_at: "2025-06-06",
    },
];

const CATEGORIES = [
    "All",
    "Electronics",
    "Furniture",
    "Sports",
    "Books",
    "Home",
    "Clothing",
    "Vehicles",
    "Other",
];
const SORT_OPTIONS = [
    { label: "Newest", value: "newest" },
    { label: "Price ↑", value: "price_asc" },
    { label: "Price ↓", value: "price_desc" },
];

const fmtPrice = (p) => `৳ ${Number(p).toLocaleString()}`;

/* ── Skeleton ─────────────────────────────────────────────────── */
const Skeleton = () => (
    <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
    >
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
                key={i}
                className="card"
                style={{ padding: 0, overflow: "hidden" }}
            >
                <div
                    className="skeleton"
                    style={{ height: 160, borderRadius: 0 }}
                />
                <div style={{ padding: "1rem" }}>
                    <div
                        className="skeleton mb-2"
                        style={{ height: 14, width: "70%", borderRadius: 6 }}
                    />
                    <div
                        className="skeleton mb-2"
                        style={{ height: 18, width: "40%", borderRadius: 6 }}
                    />
                    <div
                        className="skeleton"
                        style={{ height: 11, width: "55%", borderRadius: 6 }}
                    />
                </div>
            </div>
        ))}
    </div>
);

/* ── Listing Card ─────────────────────────────────────────────── */
const ListingCard = ({ listing }) => (
    <div
        className="card card-hover animate-fade-in"
        style={{
            padding: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}
    >
        {/* Image */}
        <div
            className="flex-center flex-shrink-0"
            style={{
                height: 160,
                background: listing.images?.[0]
                    ? `url(${import.meta.env.VITE_STORAGE_URL}/${listing.images[0]}) center/cover`
                    : "var(--bg-surface-2)",
                borderBottom: "1px solid var(--border)",
                position: "relative",
            }}
        >
            {!listing.images?.[0] && (
                <span style={{ fontSize: "2.5rem", opacity: 0.4 }}>🛍️</span>
            )}
            {listing.status === "sold" && (
                <div
                    className="absolute inset-0 flex-center"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                >
                    <span
                        className="pill pill-danger"
                        style={{ fontSize: "0.8rem", fontWeight: 700 }}
                    >
                        SOLD
                    </span>
                </div>
            )}
            <span
                className="absolute top-2 left-2 pill pill-muted"
                style={{ fontSize: "0.68rem" }}
            >
                {listing.category}
            </span>
        </div>

        {/* Info */}
        <div
            style={{
                padding: "0.9rem 1rem",
                flex: 1,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <h4
                className="font-semibold mb-1 truncate"
                style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}
            >
                {listing.title}
            </h4>
            <p
                className="font-bold mb-1"
                style={{
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                }}
            >
                {fmtPrice(listing.price)}
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                📍 {listing.location}
            </p>

            {/* Seller row */}
            <div
                className="flex items-center gap-2 mt-auto pt-2"
                style={{ borderTop: "1px solid var(--border)" }}
            >
                <Link
                    to={`/${listing.user?.username}`}
                    className="flex-shrink-0"
                >
                    <Avatar user={listing.user} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                    <p
                        className="text-xs font-medium truncate"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        {listing.user?.firstName} {listing.user?.lastName}
                    </p>
                    <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {new Date(listing.created_at).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => toast.info("Messaging coming soon!")}
                >
                    Message
                </button>
            </div>
        </div>
    </div>
);

/* ── Create Listing Modal ─────────────────────────────────────── */
const CreateListingModal = ({ onClose, onCreated }) => {
    const { api } = useAxios();
    const fileRef = useRef();
    const [form, setForm] = useState({
        title: "",
        price: "",
        description: "",
        category: "Electronics",
        location: "",
    });
    const [images, setImages] = useState([]);
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleFiles = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setImages(
            files.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            images.forEach((img) => data.append("images[]", img.file));
            const res = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/listings`,
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
            toast.success("Listing created!");
            onCreated(res.data?.data ?? res.data);
        } catch {
            toast.error("Failed to create listing.");
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
                        🛍️ Sell an Item
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-icon"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Photo upload */}
                    <div className="mb-4">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Photos (up to 5)
                        </label>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square overflow-hidden"
                                        style={{
                                            borderRadius: 10,
                                            border: "1px solid var(--border)",
                                        }}
                                    >
                                        <img
                                            src={img.preview}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                onClick={() => fileRef.current.click()}
                                className="flex-center flex-col cursor-pointer rounded-xl mb-2"
                                style={{
                                    height: 100,
                                    border: "2px dashed var(--border)",
                                    background: "var(--bg-surface-2)",
                                }}
                            >
                                <span style={{ fontSize: "1.5rem" }}>📷</span>
                                <p
                                    className="text-xs mt-1"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    Click to add photos
                                </p>
                            </div>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFiles}
                        />
                        {images.length > 0 && (
                            <button
                                type="button"
                                onClick={() => fileRef.current.click()}
                                className="text-xs"
                                style={{ color: "var(--accent)" }}
                            >
                                Change photos
                            </button>
                        )}
                    </div>

                    {[
                        {
                            label: "Title",
                            key: "title",
                            type: "text",
                            placeholder: "What are you selling?",
                        },
                        {
                            label: "Price (৳)",
                            key: "price",
                            type: "number",
                            placeholder: "0",
                        },
                        {
                            label: "Location",
                            key: "location",
                            type: "text",
                            placeholder: "Your area",
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
                                required
                                type={f.type}
                                className="input"
                                placeholder={f.placeholder}
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
                            Category
                        </label>
                        <select
                            className="input"
                            value={form.category}
                            onChange={(e) => set("category", e.target.value)}
                        >
                            {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-5">
                        <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Description
                        </label>
                        <textarea
                            className="input"
                            rows={3}
                            style={{ resize: "none" }}
                            placeholder="Describe your item…"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
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
                            {saving ? "Posting…" : "Post Listing"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ── MarketplacePage ──────────────────────────────────────────── */
const MarketplacePage = () => {
    const { api } = useAxios();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("newest");
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`${import.meta.env.VITE_SERVER_BASE_URL}/listings`)
            .then((r) => setListings(r.data?.data ?? r.data ?? []))
            .catch(() => setListings(MOCK_LISTINGS))
            .finally(() => setLoading(false));
    }, []);

    const filtered = listings
        .filter((l) => {
            const matchCat = category === "All" || l.category === category;
            const matchSearch = `${l.title} ${l.description} ${l.location}`
                .toLowerCase()
                .includes(search.toLowerCase());
            return matchCat && matchSearch && l.status !== "sold";
        })
        .sort((a, b) => {
            if (sort === "price_asc") return a.price - b.price;
            if (sort === "price_desc") return b.price - a.price;
            return new Date(b.created_at) - new Date(a.created_at);
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
                        🛍️ Marketplace
                    </h1>
                    <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Buy and sell locally
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn btn-primary btn-sm"
                >
                    + Sell Item
                </button>
            </div>

            {/* Search + sort */}
            <div className="flex gap-2">
                <div className="relative flex-1">
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
                        placeholder="Search listings…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="input"
                    style={{ width: "auto", flexShrink: 0 }}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="btn btn-sm btn-round"
                        style={
                            category === cat
                                ? { background: "var(--accent)", color: "#fff" }
                                : {
                                      background: "var(--bg-surface-2)",
                                      color: "var(--text-muted)",
                                      border: "1px solid var(--border)",
                                  }
                        }
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Count */}
            {!loading && filtered.length > 0 && (
                <p
                    className="text-xs px-1"
                    style={{ color: "var(--text-muted)" }}
                >
                    {filtered.length} listings
                </p>
            )}

            {loading && <Skeleton />}

            {!loading && filtered.length === 0 && (
                <div
                    className="card flex-center flex-col"
                    style={{ padding: "4rem 2rem", textAlign: "center" }}
                >
                    <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                        🛍️
                    </span>
                    <h3
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                    >
                        No listings found
                    </h3>
                    <p
                        className="text-sm mb-4"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Be the first to sell something!
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="btn btn-primary btn-sm"
                    >
                        Post a Listing
                    </button>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <div
                    className="grid gap-3 animate-fade-in"
                    style={{
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(240px, 1fr))",
                    }}
                >
                    {filtered.map((l) => (
                        <ListingCard key={l.id} listing={l} />
                    ))}
                </div>
            )}

            {showCreate && (
                <CreateListingModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(l) => {
                        setListings((prev) => [l, ...prev]);
                        setShowCreate(false);
                    }}
                />
            )}
        </AppLayout>
    );
};

export default MarketplacePage;
