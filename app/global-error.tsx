"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Gamlish hit a temporary error</h1>
          <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>
            Please refresh the page. If this keeps happening after a deploy, clear
            site data for gamlish.com and try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              border: 0,
              borderRadius: 999,
              background: "#1e3a8a",
              color: "#fff",
              padding: "12px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: 16, fontSize: 11, color: "#94a3b8" }}>
            {error.digest ? `Ref: ${error.digest}` : null}
          </p>
        </div>
      </body>
    </html>
  );
}
