/**
 * PageLayout — wraps all authenticated pages with the sticky header
 * and a consistent content container.
 */
const PageLayout = ({ children }) => {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <main className="max-w-3xl mx-auto">{children}</main>
        </div>
    );
};

export default PageLayout;
