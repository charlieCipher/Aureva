/* eslint-disable */
function Pricing({ onClose, currentPlan = "free" }) {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      storage: "50 MB",
      color: "#64748b",
      features: [
        "✅ Basic vault",
        "✅ Encrypt & upload files",
        "✅ View your assets",
        "✅ Data stored forever",
        "❌ Family Instructions View",
        "❌ Legal Export PDF",
        "❌ Life Completeness Score",
      ],
      cta: "Current Plan",
      disabled: true,
    },
    {
      name: "Standard",
      price: "₹1,299",
      period: "one-time",
      storage: "2 GB",
      color: "#6366f1",
      popular: true,
      features: [
        "✅ Everything in Free",
        "✅ 2 GB storage",
        "✅ Family Instructions View",
        "✅ Legal Export PDF",
        "✅ Life Completeness Score",
        "✅ Priority support",
        "❌ Advanced features",
      ],
      cta: "Upgrade — ₹1,299",
      disabled: false,
      upiId: "9763932393@ibl",
    },
    {
      name: "Legacy Pack",
      price: "₹6,999",
      period: "one-time",
      storage: "10 GB",
      color: "#f59e0b",
      features: [
        "✅ Everything in Standard",
        "✅ 10 GB storage",
        "✅ All future features",
        "✅ Priority support",
        "✅ Family Shield features",
        "✅ Legal Export (advanced)",
        "✅ Lifetime upgrades",
      ],
      cta: "Get Legacy Pack — ₹6,999",
      disabled: false,
      upiId: "9763932393@ibl",
    },
  ];

  function handleUpgrade(plan) {
    const message = `Hi, I want to upgrade to the ${plan.name} plan (${plan.price}). My email is [your email]. Please share payment details.`;
    const whatsappUrl = `https://wa.me/919370096312?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24, color: "#6366f1" }}>
              🔐 Continuum
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              Choose your plan
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "#1e293b",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            ← Back
          </button>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: 26, color: "white" }}>
            Secure your family's future
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
            Pay once. Your data stays safe forever.
          </p>
        </div>

        {/* Emotional nudge */}
        <div
          style={{
            background: "#1c1107",
            border: "1px solid #f59e0b",
            borderRadius: 10,
            padding: 16,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, color: "#f59e0b", fontSize: 14 }}>
            💬 <strong>"Your family won't know what you own."</strong>
            <br />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              Unlock Family Instructions View — ₹1,299, one time.
            </span>
          </p>
        </div>

        {/* Plans */}
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
              border: plan.popular
                ? `2px solid ${plan.color}`
                : "1px solid #334155",
              position: "relative",
            }}
          >
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: plan.color,
                  color: "white",
                  fontSize: 11,
                  fontWeight: "bold",
                  padding: "4px 16px",
                  borderRadius: 20,
                }}
              >
                MOST POPULAR
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    color: plan.color,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {plan.name}
                </p>
                <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                  📦 {plan.storage} storage
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 24,
                  }}
                >
                  {plan.price}
                </p>
                <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>
                  {plan.period}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 20,
              }}
            >
              {plan.features.map((f) => (
                <p
                  key={f}
                  style={{
                    margin: 0,
                    color: f.startsWith("✅") ? "#94a3b8" : "#475569",
                    fontSize: 13,
                  }}
                >
                  {f}
                </p>
              ))}
            </div>

            <button
              onClick={() => !plan.disabled && handleUpgrade(plan)}
              disabled={plan.disabled}
              style={{
                width: "100%",
                padding: "12px",
                background: plan.disabled ? "#334155" : plan.color,
                color: "white",
                border: "none",
                cursor: plan.disabled ? "not-allowed" : "pointer",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: "bold",
                opacity: plan.disabled ? 0.6 : 1,
              }}
            >
              {plan.cta}
            </button>
          </div>
        ))}

        {/* Manual payment note */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 10,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              color: "white",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            💳 How to Pay
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "1. Click the upgrade button above",
              "2. Send payment via UPI to: yourcontinuum@upi",
              "3. Screenshot your payment confirmation",
              "4. Send screenshot on WhatsApp",
              "5. Your plan will be upgraded within 2 hours",
            ].map((step) => (
              <p
                key={step}
                style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}
              >
                {step}
              </p>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#475569", fontSize: 12 }}>
            🔒 Your data is never deleted — even if you don't pay.
            <br />
            Upgrade only adds more storage and features.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
