/* eslint-disable */
function TrustBadges() {
  const badges = [
    {
      title: "Client-side encryption",
      desc: "Files are encrypted before upload, so sensitive records are not stored as plain files.",
    },
    {
      title: "Recovery key protected",
      desc: "Your recovery key is shown once. Aureva cannot recover encrypted data without it.",
    },
    {
      title: "RLS-first privacy",
      desc: "User records are separated with row-level security and owner-only access rules.",
    },
    {
      title: "Read-only continuity",
      desc: "Continuity access is designed for guidance, not editing, deleting, or unrestricted browsing.",
    },
  ];

  return (
    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #ECECF2",
        borderRadius: 24,
        padding: 28,
        marginBottom: 24,
        boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
      }}
    >
      <p style={{ margin: "0 0 8px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
        TRUST
      </p>
      <h2 style={{ margin: "0 0 18px 0", color: "#111827", fontSize: 28 }}>Security Promises</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {badges.map((badge) => (
          <div
            key={badge.title}
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(93,111,86,0.12)",
              borderRadius: 18,
              padding: 18,
            }}
          >
            <p style={{ margin: "0 0 6px 0", color: "#111827", fontSize: 15, fontWeight: 850 }}>
              {badge.title}
            </p>
            <p style={{ margin: 0, color: "#6B7280", fontSize: 13, lineHeight: 1.55 }}>
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges;
