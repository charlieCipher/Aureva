/* eslint-disable */
function TrustBadges() {
  const badges = [
    {
      icon: "🔒",
      title: "AES-256 Encryption",
      desc: "Your files are encrypted on your device before upload. We never see your data.",
      color: "#6366f1",
    },
    {
      icon: "🧠",
      title: "Only You Can Access",
      desc: "Your recovery phrase is the only way to recover your data. We cannot reset it.",
      color: "#10b981",
    },
    {
      icon: "♾️",
      title: "Data Stays Forever",
      desc: "We never delete your data — even on the free tier. Your vault is permanent.",
      color: "#f59e0b",
    },
    {
      icon: "👁️",
      title: "Zero Knowledge",
      desc: "We cannot read your files. Your encryption key never leaves your device.",
      color: "#3b82f6",
    },
  ];

  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <h2 style={{ margin: "0 0 6px 0", color: "white", fontSize: 18 }}>
        🛡️ Security Promises
      </h2>
      <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 13 }}>
        We built Continuum on these non-negotiable principles.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {badges.map((b) => (
          <div
            key={b.title}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "14px 16px",
              background: "#0f172a",
              borderRadius: 10,
              borderLeft: `3px solid ${b.color}`,
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{b.icon}</span>
            <div>
              <p
                style={{
                  margin: "0 0 4px 0",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {b.title}
              </p>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustBadges;
