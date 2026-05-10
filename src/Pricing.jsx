/* eslint-disable */
function Pricing({ onClose, userTier }) {
  const tiers = [
    {
      name: "Free",
      price: "Rs. 0",
      storage: "50 MB",
      features: ["Basic vault", "Add assets", "Upload and view files"],
      tier: "free",
      button: "Current Plan",
      disabled: true,
    },
    {
      name: "Standard",
      price: "Rs. 1,299",
      storage: "2 GB",
      features: ["Everything in Free", "Family Instructions View", "Full vault"],
      tier: "standard",
      button: "Upgrade to Standard",
      disabled: false,
    },
    {
      name: "Legacy Pack",
      price: "Rs. 6,999",
      storage: "10 GB",
      features: ["Everything in Standard", "Legal Export PDF", "Priority support", "Future upgrades"],
      tier: "legacy",
      button: "Upgrade to Legacy",
      disabled: false,
    },
  ];

  function handleUpgrade(tier) {
    const message = `Hi, I want to upgrade my Aureva vault to ${tier} plan. My email is: `;
    window.open(`https://wa.me/919370096312?text=${encodeURIComponent(message)}`, "_blank");
  }

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(255,255,250,0.95), transparent 32rem), linear-gradient(135deg, #e6ecdf 0%, #f8f7f1 50%, #dfe8dc 100%)",
    color: "#171b14",
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
              background: "rgba(255,255,250,0.78)",
              color: "#5f6b59",
              border: "1px solid rgba(93,111,86,0.16)",
              cursor: "pointer",
              borderRadius: 999,
              fontWeight: 800,
            }}
          >
            Back
          </button>
          <div
            style={{
              background: "rgba(255,255,250,0.9)",
              border: "1px solid rgba(93,111,86,0.16)",
              borderRadius: 28,
              padding: 38,
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
            }}
          >
            <p style={{ margin: "0 0 10px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
              ADMIN ACCESS
            </p>
            <h1 style={{ margin: "0 0 8px 0", color: "#171b14", fontSize: 34 }}>
              Monetization disabled for this account
            </h1>
            <p style={{ margin: 0, color: "#6f766a", fontSize: 15, lineHeight: 1.6 }}>
              This email has full Aureva access without payment prompts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <button
          onClick={onClose}
          style={{
            marginBottom: 22,
            padding: "10px 16px",
            background: "rgba(255,255,250,0.78)",
            color: "#5f6b59",
            border: "1px solid rgba(93,111,86,0.16)",
            cursor: "pointer",
            borderRadius: 999,
            fontWeight: 800,
          }}
        >
          Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            PRICING
          </p>
          <h1 style={{ margin: "0 0 8px 0", color: "#171b14", fontSize: 46, lineHeight: 1.05 }}>
            Choose how your family prepares.
          </h1>
          <p style={{ margin: 0, color: "#6f766a", fontSize: 15 }}>
            Pay once. Your data stays safe forever.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
          {tiers.map((tier) => {
            const isCurrent = userTier === tier.tier;
            const featured = tier.tier === "standard";
            return (
              <div
                key={tier.name}
                style={{
                  background: featured ? "#7f9278" : "rgba(255,255,250,0.9)",
                  color: featured ? "#fffefa" : "#171b14",
                  border: featured ? "1px solid #7f9278" : "1px solid rgba(93,111,86,0.16)",
                  borderRadius: 28,
                  padding: 28,
                  boxShadow: featured
                    ? "0 24px 60px rgba(95,115,89,0.24)"
                    : "0 24px 60px rgba(58,69,52,0.12)",
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
                    RECOMMENDED
                  </span>
                )}
                <h2 style={{ margin: "0 0 4px 0", color: "inherit", fontSize: 26 }}>{tier.name}</h2>
                <p style={{ margin: "0 0 18px 0", color: featured ? "rgba(255,255,250,0.75)" : "#6f766a", fontSize: 13 }}>
                  {tier.storage} storage
                </p>
                <p style={{ margin: "0 0 22px 0", fontSize: 34, fontWeight: 900 }}>{tier.price}</p>

                <div style={{ display: "grid", gap: 9, marginBottom: 22 }}>
                  {tier.features.map((feature) => (
                    <p key={feature} style={{ margin: 0, color: featured ? "#fffefa" : "#5f6b59", fontSize: 14 }}>
                      {feature}
                    </p>
                  ))}
                </div>

                {isCurrent ? (
                  <div
                    style={{
                      padding: "12px",
                      background: featured ? "rgba(255,255,250,0.14)" : "#e8eee4",
                      borderRadius: 999,
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 850,
                    }}
                  >
                    Your Current Plan
                  </div>
                ) : tier.disabled ? null : (
                  <button
                    onClick={() => handleUpgrade(tier.name)}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: featured ? "#fffefa" : "#171b14",
                      color: featured ? "#171b14" : "#fffefa",
                      border: featured ? "1px solid #fffefa" : "1px solid #171b14",
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
