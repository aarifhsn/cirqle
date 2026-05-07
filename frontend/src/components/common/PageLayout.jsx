/**
 * PageLayout — wraps all authenticated pages with the sticky header
 * and a consistent content container.
 */
const PageLayout = ({ children }) => {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <main
                style={{
                    maxWidth: "720px",
                    margin: "0 auto",
                    padding: "1.5rem 1rem 4rem",
                }}
            >
                {children}
            </main>
        </div>
    );
};

export default PageLayout;
