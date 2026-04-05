/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "./supabase";

function FamilySettings({ session }) {
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data } = await supabase
      .from("profiles")
      .select("family_code")
      .eq("id", session.user.id)
      .single();
    if (data) {
      setPin(data.family_code || "");
      if (data.family_code) {
        setShareLink(`${window.location.origin}/family#${session.user.id}`);
      }
    }
    setLoading(false);
  }

  async function savePin() {
    if (!pin || pin.length < 4)
      return setMessage("PIN must be at least 4 characters.");
    setSaving(true);
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, family_code: pin });
    if (error) {
      setMessage("Failed: " + error.message);
    } else {
      setMessage("PIN saved! ✅");
      setShareLink(`${window.location.origin}/family#${session.user.id}`);
    }
    setSaving(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareLink);
    setMessage("Link copied! ✅ Share this with your family.");
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: "12px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 6,
    color: "white",
    fontSize: 16,
    boxSizing: "border-box",
    letterSpacing: 4,
  };

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: 24 }}>
      <h2 style={{ margin: "0 0 8px 0", color: "white", fontSize: 18 }}>
        👨‍👩‍👧 Family Access Settings
      </h2>
      <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: 13 }}>
        Set a PIN that your family will use to access your vault.
      </p>

      {/* How it works */}
      <div
        style={{
          background: "#0f172a",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            color: "#6366f1",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          HOW IT WORKS
        </p>
        {[
          "1. Set a secret PIN below",
          "2. Click Save PIN",
          "3. Copy the family link",
          "4. Share the link + PIN privately with your family",
          "5. They open the link, enter the PIN, and see your assets",
        ].map((s) => (
          <p
            key={s}
            style={{ margin: "0 0 4px 0", color: "#94a3b8", fontSize: 13 }}
          >
            {s}
          </p>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading...</p>
      ) : (
        <>
          <p style={{ margin: "0 0 6px 0", color: "#64748b", fontSize: 12 }}>
            YOUR FAMILY PIN
          </p>
          <input
            type="text"
            placeholder="e.g. Ram2024"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={inputStyle}
          />

          <button
            onClick={savePin}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              background: "#6366f1",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            {saving ? "Saving..." : "💾 Save PIN"}
          </button>

          {shareLink && (
            <div
              style={{
                background: "#0f172a",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "#10b981",
                  fontSize: 13,
                  fontWeight: "bold",
                }}
              >
                📤 Share with your family:
              </p>
              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "#94a3b8",
                  fontSize: 12,
                  wordBreak: "break-all",
                }}
              >
                {shareLink}
              </p>
              <p
                style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: 13 }}
              >
                PIN: <strong style={{ color: "white" }}>{pin}</strong>
              </p>
              <button
                onClick={copyLink}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                📋 Copy Family Link
              </button>
            </div>
          )}

          {message && (
            <p
              style={{
                color: message.includes("✅") ? "#10b981" : "#ef4444",
                fontSize: 14,
                marginTop: 8,
              }}
            >
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default FamilySettings;
