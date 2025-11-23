export default function Loading() {
  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="bb-header">
          <div className="bb-header-logo" />
          <div className="bb-header-text">
            <h1 className="bb-header-title">Byte & Block Snack</h1>
            <p className="bb-header-subtitle">
              Loading BTC mood and today&apos;s byte…
            </p>
          </div>
        </header>

        <div className="bb-grid">
          {/* Skeleton cards */}
          {[1, 2, 3].map((i) => (
            <section
              key={i}
              className="bb-card"
              style={{ opacity: 0.7 }}
            >
              <div className="bb-card-inner">
                <div
                  className="bb-card-header"
                  style={{ marginBottom: "8px" }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "10px",
                      borderRadius: "999px",
                      background: "rgba(148,163,184,0.3)",
                    }}
                  />
                  <div
                    style={{
                      width: "50px",
                      height: "10px",
                      borderRadius: "999px",
                      background: "rgba(148,163,184,0.2)",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: "80%",
                    height: "14px",
                    borderRadius: "999px",
                    background: "rgba(148,163,184,0.25)",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    width: "60%",
                    height: "12px",
                    borderRadius: "999px",
                    background: "rgba(148,163,184,0.15)",
                  }}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
