/* eslint-disable */
function TrustBadges() {
  const badges = [
    {
      title: "Device-side encryption",
      desc: "Files are encrypted on your device before upload.",
    },
    {
      title: "Family Recovery Key",
      desc: "Your key is shown once. Your file encryption key stays with you.",
    },
    {
      title: "Private by design",
      desc: "Aureva is built around minimum access and clear family instructions.",
    },
  ];

  return (
    <section
      style={{
        background: "rgba(255,255,250,0.88)",
        border: "1px solid rgba(93,111,86,0.16)",
        borderRadius: 24,
        padding: 28,
        marginBottom: 24,
        boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
      }}
    >
      <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
        TRUST
      </p>
      <h2 style={{ margin: "0 0 18px 0", color: "#171b14", fontSize: 28 }}>Security Promises</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {badges.map((badge) => (
          <div
            key={badge.title}
            style={{
              background: "#f7f6f0",
              border: "1px solid rgba(93,111,86,0.12)",
              borderRadius: 18,
              padding: 18,
            }}
          >
            <p style={{ margin: "0 0 6px 0", color: "#171b14", fontSize: 15, fontWeight: 850 }}>
              {badge.title}
            </p>
            <p style={{ margin: 0, color: "#6f766a", fontSize: 13, lineHeight: 1.55 }}>
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges;
