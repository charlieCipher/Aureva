/* eslint-disable */
function Pricing({ onClose, userTier }) {
  const currentTier = userTier === "free" ? "secure_onboarding" : userTier;
  const tiers = [
    {
      name: "Secure Onboarding Vault",
      price: "Included",
      type: "45-day onboarding access",
      tier: "secure_onboarding",
      features: ["5 continuity items", "1 family member", "Full security core", "Recovery phrase protection"],
      button: "Current Access",
      disabled: true,
    },
    {
      name: "Legacy Vault",
      price: "One-time",
      type: "Core paid vault",
      tier: "standard",
      features: ["More storage", "Family continuity access", "Continuity export PDF", "Restore history"],
      button: "Upgrade to Legacy Vault",
    },
    {
      name: "Legacy Black",
      price: "Subscription",
      type: "Monitoring plan",
      tier: "legacy_black",
      features: ["Session analytics", "Advanced audit retention", "Integrity verification", "Priority support"],
      button: "Ask for Legacy Black",
    },
    {
      name: "Dynasty Vault",
      price: "One-time premium",
      type: "High-trust family plan",
      tier: "legacy",
      features: ["Premium storage", "Expanded continuity preparation", "More shared family slots", "Advanced organization"],
      button: "Upgrade to Dynasty Vault",
    },
    {
      name: "Continuity+",
      price: "Subscription",
      type: "Long-term continuity support",
      tier: "continuity_plus",
      features: ["Advanced monitoring", "Future upgrades", "Premium continuity support", "Enhanced protection systems"],
      button: "Ask for Continuity+",
    },
  ];

  function handleUpgrade(tier) {
    const message = `Hi, I want to upgrade my Aureva account to ${tier}. My email is: `;
    window.open(`https://wa.me/919370096312?text=${encodeURIComponent(message)}`, "_blank");
  }

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(255,255,250,0.95), transparent 32rem), linear-gradient(135deg, #e6ecdf 0%, #f8f7f1 50%, #dfe8dc 100%)",
    color: "#111827",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: 24,
  };

  if (userTier === "admin") {
    return (
      <div style={pageStyle}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <button
            onClick={onClose}
            style={{
              marginBottom: 20,
              padding: "10px 16px",
              background: "#FFFFFF",
              color: "#5f6b59",
              border: "1px solid #ECECF2",
              cursor: "pointer",
              borderRadius: 999,
              fontWeight: 800,
            }}
          >
            Back
          </button>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #ECECF2",
              borderRadius: 28,
              padding: 38,
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
            }}
          >
            <p style={{ margin: "0 0 10px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
              ADMIN ACCESS
            </p>
            <h1 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: 34 }}>
              Monetization disabled for this account
            </h1>
            <p style={{ margin: 0, color: "#6B7280", fontSize: 15, lineHeight: 1.6 }}>
              This email has full Aureva access without payment prompts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <button
          onClick={onClose}
          style={{
            marginBottom: 22,
            padding: "10px 16px",
            background: "#FFFFFF",
            color: "#5f6b59",
            border: "1px solid #ECECF2",
            cursor: "pointer",
            borderRadius: 999,
            fontWeight: 800,
          }}
        >
          Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 8px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            MONETIZATION ARCHITECTURE
          </p>
          <h1 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: 46, lineHeight: 1.05 }}>
            Choose the continuity layer your family needs.
          </h1>
          <p style={{ margin: 0, color: "#6B7280", fontSize: 15, maxWidth: 760, lineHeight: 1.6 }}>
            Core security is never reduced. Every plan includes encryption, recovery phrase protection,
            RLS-backed privacy, and safe continuity fundamentals.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
          {tiers.map((tier) => {
            const isCurrent = currentTier === tier.tier;
            const featured = tier.tier === "standard";
            return (
              <div
                key={tier.name}
                style={{
                  background: featured ? "#6D5EF5" : "#FFFFFF",
                  color: featured ? "#FFFFFF" : "#111827",
                  border: featured ? "1px solid #6D5EF5" : "1px solid #ECECF2",
                  borderRadius: 28,
                  padding: 26,
                  boxShadow: featured
                    ? "0 24px 60px rgba(95,115,89,0.24)"
                    : "0 24px 60px rgba(17,24,39,0.08)",
                }}
              >
                {featured && (
                  <span
                    style={{
                      display: "inline-flex",
                      marginBottom: 14,
                      padding: "5px 10px",
                      background: "rgba(255,255,250,0.16)",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    CORE PAID PLAN
                  </span>
                )}
                <h2 style={{ margin: "0 0 4px 0", color: "inherit", fontSize: 25 }}>{tier.name}</h2>
                <p style={{ margin: "0 0 14px 0", color: featured ? "rgba(255,255,250,0.75)" : "#6B7280", fontSize: 13 }}>
                  {tier.type}
                </p>
                <p style={{ margin: "0 0 20px 0", fontSize: 27, fontWeight: 900 }}>{tier.price}</p>

                <div style={{ display: "grid", gap: 9, marginBottom: 22 }}>
                  {tier.features.map((feature) => (
                    <p key={feature} style={{ margin: 0, color: featured ? "#FFFFFF" : "#5f6b59", fontSize: 14, lineHeight: 1.45 }}>
                      {feature}
                    </p>
                  ))}
                </div>

                {isCurrent ? (
                  <div
                    style={{
                      padding: "12px",
                      background: featured ? "rgba(255,255,250,0.14)" : "#F0EDFF",
                      borderRadius: 999,
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 850,
                    }}
                  >
                    Current Access
                  </div>
                ) : tier.disabled ? null : (
                  <button
                    onClick={() => handleUpgrade(tier.name)}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: featured ? "#FFFFFF" : "#111827",
                      color: featured ? "#111827" : "#FFFFFF",
                      border: featured ? "1px solid #FFFFFF" : "1px solid #111827",
                      cursor: "pointer",
                      borderRadius: 999,
                      fontSize: 15,
                      fontWeight: 850,
                    }}
                  >
                    {tier.button}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Pricing;
