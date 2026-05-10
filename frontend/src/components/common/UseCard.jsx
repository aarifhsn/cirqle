/* UserCard.jsx (UseCard.jsx) — Cirqle v2
 * Changes:
 * - text-white → var(--text-primary)
 * - hover:text-lwsGreen → CSS var via onMouseEnter
 * - text-gray-500 → var(--text-muted)
 * - bg-lighterDark, border-[#3F3F3F] → CSS vars
 * - bg-lwsGreen text-deepDark → .btn.btn-primary
 * - hover:bg-red-500/20 hover:text-red-400 → var(--danger-soft) / var(--danger)
 * - All follow API logic 100% untouched
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import Avatar from "./Avatar";

const UserCard = ({ person }) => {
    const { auth } = useAuth();
    const { api } = useAxios();
    const [isFollowing, setIsFollowing] = useState(person.isFollowing);
    const [hovered, setHovered] = useState(false);
    const isMe =
        person.id === auth?.user?.id ||
        person.username === auth?.user?.username;

    /* ── Original follow logic untouched ─────────────────────── */
    const handleFollow = async () => {
        try {
            const response = await api.post(
                `${import.meta.env.VITE_SERVER_BASE_URL}/users/${person.id}/follow`,
            );
            if (response.status === 200) {
                setIsFollowing(response.data.isFollowing);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to update follow!");
        }
    };

    const profileLink = person.username
        ? `/${person.username}`
        : `/users/${person.id}`;

    return (
        <div className="card flex items-center gap-3 p-4 card-hover">
            <Link to={profileLink} className="flex-shrink-0">
                <Avatar user={person} size="md" />
            </Link>

            <div className="flex-1 min-w-0">
                <Link
                    to={profileLink}
                    className="block font-semibold text-sm truncate transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--accent)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-primary)")
                    }
                >
                    {person.firstName} {person.lastName}
                </Link>
                <p
                    className="text-xs truncate"
                    style={{ color: "var(--text-muted)" }}
                >
                    @{person.username ?? person.email}
                </p>
            </div>

            {!isMe && (
                <button
                    onClick={handleFollow}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    className="flex-shrink-0 btn btn-sm btn-round"
                    style={
                        isFollowing
                            ? {
                                  background: hovered
                                      ? "var(--danger-soft)"
                                      : "var(--bg-surface-2)",
                                  color: hovered
                                      ? "var(--danger)"
                                      : "var(--text-secondary)",
                                  border: `1px solid ${hovered ? "var(--danger)" : "var(--border)"}`,
                                  transition: "all var(--transition-fast)",
                              }
                            : {}
                    }
                    /* Use .btn-primary only for Follow state */
                    {...(!isFollowing && {
                        className:
                            "flex-shrink-0 btn btn-primary btn-sm btn-round",
                    })}
                >
                    {isFollowing
                        ? hovered
                            ? "Unfollow"
                            : "Following"
                        : "Follow"}
                </button>
            )}
        </div>
    );
};

export default UserCard;
