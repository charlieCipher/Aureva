/* eslint-disable */
function Pricing({ onClose, userTier }) {
  const tiers = [
    {
      name: "Free",
      price: "₹0",
      storage: "50 MB",
      features: ["Basic vault", "Upload & view files", "Add assets"],
      tier: "free",
      button: "Current Plan",
      disabled: true,
    },
    {
      name: "Standard",
      price: "₹1,299",
      storage: "2 GB",
      features: ["Everything in Free", "Family Instructions View", "Full vault"],
      tier: "standard",
      button: "Upgrade to Standard",
      disabled: false,
    },
    {
      name: "Legacy Pack",
      price: "₹6,999",
      storage: "10 GB",
      features: ["Everything in Standard", "Legal Export PDF", "Priority support", "Future upgrades"],
      tier: "legacy",
      button: "Upgrade to Legacy",
      disabled: false,
    },
  ];

  function handleUpgrade(tier) {
    const message = `Hi, I want to upgrade my Continuum vault to ${tier} plan. My email is: `;
    window.open(`https://wa.me/919370096312?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0f172a", color: "white",
      fontFamily: "Arial", padding: "20px",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <button
          onClick={onClose}
          style={{
            marginBottom: 20, padding: "8px 16px", background: "#1e293b",
            color: "white", border: "none", cursor: "pointer", borderRadius: 8, fontSize: 14,
          }}
        >
          ← Back
        </button>

        <h1 style={{ margin: "0 0 8px 0", color: "#6366f1", fontSize: 24 }}>⭐ Upgrade Your Vault</h1>
        <p style={{ margin: "0 0 32px 0", color: "#64748b", fontSize: 14 }}>
          Pay once. Your data stays safe forever.
        </p>

        {tiers.map((t) => (
          <div key={t.name} style={{
            background: t.tier === "legacy" ? "#1e1b4b" : "#1e293b",
            borderRadius: 12, padding: 24, marginBottom: 16,
            border: t.tier === "legacy" ? "1px solid #6366f1" : "1px solid #334155",
          }}>
            {t.tier === "legacy" && (
              <span style={{
                background: "#6366f1", color: "white", fontSize: 11,
                padding: "2px 10px", borderRadius: 20, fontWeight: "bold", marginBottom: 8, display: "inline-block",
              }}>
                BEST VALUE
              </span>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, color: "white", fontSize: 20 }}>{t.name}</h2>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>{t.storage} storage</p>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "#6366f1" }}>{t.price}</p>
            </div>

            {t.features.map((f) => (
              <p key={f} style={{ margin: "0 0 6px 0", color: "#94a3b8", fontSize: 13 }}>
                ✓ {f}
              </p>
            ))}

            {userTier === t.tier ? (
              <div style={{
                marginTop: 16, padding: "10px", background: "#10b981",
                borderRadius: 8, textAlign: "center", fontSize: 14, fontWeight: "bold",
              }}>
                ✅ Your Current Plan
              </div>
            ) : t.disabled ? null : (
              <>
                <button
                  onClick={() => handleUpgrade(t.name)}
                  style={{
                    marginTop: 16, width: "100%", padding: "12px",
                    background: "#6366f1", color: "white", border: "none",
                    cursor: "pointer", borderRadius: 8, fontSize: 15, fontWeight: "bold",
                  }}
                >
                  {t.button} →
                </button>
                <div style={{ marginTop: 12, background: "#0f172a", borderRadius: 8, padding: 12 }}>
                  <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: 12 }}>PAY VIA UPI</p>
                  <p style={{ margin: "0 0 4px 0", color: "white", fontSize: 14, fontWeight: "bold" }}>
                    9763932393@ibl
                  </p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                    After payment, click the button above to send screenshot on WhatsApp
                  </p>
                </div>
              </>
            )}
          </div>
        ))}

        <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, marginTop: 8 }}>
          <p style={{ margin: "0 0 4px 0", color: "#10b981", fontSize: 14, fontWeight: "bold" }}>
            🔒 Data never deleted
          </p>
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
            Even on the free tier, your data is safe forever. Upgrading only unlocks more storage and features.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;