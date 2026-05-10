/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function FamilyView() {
  const [pin, setPin] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [viewed, setViewed] = useState(false);
  const userId = window.location.hash.replace("#", "");

  const typeConfig = {
    Insurance: { color: "#6366f1", bg: "#1e1b4b", icon: "🛡️" },
    Bank: { color: "#10b981", bg: "#022c22", icon: "🏦" },
    Document: { color: "#f59e0b", bg: "#1c1107", icon: "📄" },
    Property: { color: "#3b82f6", bg: "#0c1a2e", icon: "🏠" },
    Investment: { color: "#8b5cf6", bg: "#1a0f2e", icon: "📈" },
    Other: { color: "#64748b", bg: "#0f172a", icon: "📁" },
  };

  useEffect(() => {
    const savedPin = sessionStorage.getItem("family_access_pin");
    if (savedPin && userId) {
      sessionStorage.removeItem("family_access_pin");
      setPin(savedPin);
      handleAccess(savedPin);
    }
  }, [userId]);

  async function handleAccess(pinOverride) {
    const accessPin =
      typeof pinOverride === "string" ? pinOverride.trim() : pin.trim();

    if (!accessPin) return setMessage("Please enter your PIN.");
    if (!userId)
      return setMessage(
        "Invalid link. Please ask for the correct family link.",
      );

    setLoading(true);
    setMessage("");

    // Verify PIN
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, family_code")
      .eq("id", userId)
      .eq("family_code", accessPin)
      .single();

    if (profileError || !profile) {
      setMessage("❌ Wrong PIN. Please try again.");
      setLoading(false);
      return;
    }

    // Fetch assets
    const { data: assetData, error: assetError } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (assetError || !assetData || assetData.length === 0) {
      setMessage("No assets found.");
      setLoading(false);
      return;
    }

    setAssets(assetData);
    setViewed(true);
    setLoading(false);
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
            borderBottom: "1px solid #1e293b",
            paddingBottom: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24, color: "#6366f1" }}>
              🔐 Aureva
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              Family View — Read Only
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "6px 14px",
              background: "#1e293b",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            ← Back
          </button>
        </div>

        {!viewed ? (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 32 }}>
            <p
              style={{
                fontSize: 48,
                margin: "0 0 16px 0",
                textAlign: "center",
              }}
            >
              👨‍👩‍👧
            </p>
            <h2
              style={{
                margin: "0 0 8px 0",
                color: "white",
                fontSize: 20,
                textAlign: "center",
              }}
            >
              Family Access
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#64748b",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Enter the PIN shared by your loved one.
            </p>

            {!userId && (
              <div
                style={{
                  background: "#1c1107",
                  border: "1px solid #ef4444",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <p style={{ margin: 0, color: "#ef4444", fontSize: 13 }}>
                  ❌ Invalid link. Please ask your family member for the correct
                  link.
                </p>
              </div>
            )}

            <p style={{ margin: "0 0 6px 0", color: "#64748b", fontSize: 12 }}>
              FAMILY PIN
            </p>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAccess()}
              style={{
                display: "block",
                width: "100%",
                marginBottom: 16,
                padding: "14px",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 6,
                color: "white",
                fontSize: 18,
                boxSizing: "border-box",
                letterSpacing: 4,
                textAlign: "center",
              }}
            />

            <button
              onClick={() => handleAccess()}
              disabled={loading || !userId}
              style={{
                width: "100%",
                padding: "14px",
                background: "#6366f1",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {loading ? "Verifying..." : "🔓 Access Vault"}
            </button>

            {message && (
              <p
                style={{
                  color: "#ef4444",
                  marginTop: 12,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {message}
              </p>
            )}
          </div>
        ) : (
          <>
            <div
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              <p
                style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: 13 }}
              >
                Total Assets
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#6366f1",
                }}
              >
                {assets.length}
              </p>
              <p
                style={{ margin: "8px 0 0 0", color: "#94a3b8", fontSize: 13 }}
              >
                Follow the instructions for each asset carefully.
              </p>
            </div>

            <div
              style={{
                background: "#1c1107",
                border: "1px solid #f59e0b",
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <p style={{ margin: 0, color: "#f59e0b", fontSize: 13 }}>
                ⚠️ <strong>Important:</strong> This does <strong>not</strong>{" "}
                replace a registered legal will. Always consult a legal
                professional.
              </p>
            </div>

            {assets.map((a) => {
              const config = typeConfig[a.type] || {
                color: "#64748b",
                bg: "#0f172a",
                icon: "📁",
              };
              return (
                <div
                  key={a.id}
                  style={{
                    background: "#1e293b",
                    borderRadius: 12,
                    marginBottom: 16,
                    overflow: "hidden",
                    border: `1px solid ${config.color}33`,
                  }}
                >
                  <div
                    style={{
                      background: config.bg,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{config.icon}</span>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {a.title}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 10px",
                          background: config.color,
                          borderRadius: 20,
                          color: "white",
                        }}
                      >
                        {a.type}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    {a.description && (
                      <p
                        style={{
                          margin: "0 0 12px 0",
                          color: "#94a3b8",
                          fontSize: 14,
                        }}
                      >
                        {a.description}
                      </p>
                    )}
                    {a.instructions ? (
                      <div
                        style={{
                          padding: "14px 16px",
                          background: "#0f172a",
                          borderRadius: 8,
                          borderLeft: `3px solid ${config.color}`,
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            color: config.color,
                            fontSize: 11,
                            fontWeight: "bold",
                            letterSpacing: 1,
                          }}
                        >
                          📋 WHAT TO DO
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "#e2e8f0",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          {a.instructions}
                        </p>
                      </div>
                    ) : (
                      <p
                        style={{
                          color: "#475569",
                          fontSize: 13,
                          fontStyle: "italic",
                        }}
                      >
                        No instructions provided.
                      </p>
                    )}
                    {a.file_path && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: "10px 14px",
                          background: "#0f172a",
                          borderRadius: 8,
                        }}
                      >
                        <p
                          style={{ margin: 0, color: "#10b981", fontSize: 13 }}
                        >
                          📎 Document attached — ask for the decryption key to
                          access it.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default FamilyView;
