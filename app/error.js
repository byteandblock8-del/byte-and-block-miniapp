"use client";

export default function Error({ error, reset }) {
  console.error("Miniapp error boundary hit:", error);

  return (
    <div className="app-root">
      <div className="app-shell">
        <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "16px" }}>
          Something went wrong 😵
        </h2>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          The Byte &amp; Block Snack miniapp hit a snag. This is usually temporary.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            background:
              "linear-gradient(135deg, #6366f1, #22d3ee)",
            color: "#0b1020",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
