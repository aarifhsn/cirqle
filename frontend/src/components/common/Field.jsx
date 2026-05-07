import React from "react";

const Field = ({ label, children, hideLabel = false, htmlFor, error }) => {
    const id = htmlFor || getChildId(children);
    return (
        <div className="form-control">
            {!hideLabel && label && (
                <label
                    htmlFor={id}
                    className="auth-label"
                    style={{
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: "0.4rem",
                        letterSpacing: "0.02em",
                    }}
                >
                    {label}
                </label>
            )}
            {children}
            {!!error && (
                <div
                    role="alert"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.8rem",
                        color: "var(--danger)",
                        marginTop: "0.25rem",
                    }}
                >
                    <svg
                        className="w-3.5 h-3.5 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error.message}
                </div>
            )}
        </div>
    );
};

const getChildId = (children) => {
    const child = React.Children.only(children);
    if ("id" in child?.props) return child.props.id;
};

export default Field;
