/* eslint-disable */
import { useEffect, useState } from "react";
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
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("family_code")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) setMessage("Could not load existing continuity code. You can still set a new one.");

      if (data?.family_code) {
        setPin(data.family_code);
        setShareLink(`${window.location.origin}/family#${session.user.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function savePin() {
    if (!pin || pin.length < 4) {
      setMessage("Continuity code must be at least 4 characters.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, family_code: pin }, { onConflict: "id" });

    if (error) {
      setMessage("Failed: " + error.message);
    } else {
      setMessage("Continuity code saved.");
      setShareLink(`${window.location.origin}/family#${session.user.id}`);
    }

    setSaving(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink);
    setMessage("Link copied. Share this link and continuity code privately with trusted family members.");
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: "13px 15px",
    background: "#FFFFFF",
    border: "1px solid #ECECF2",
    borderRadius: 16,
    color: "#111827",
    fontSize: 16,
    boxSizing: "border-box",
    letterSpacing: 4,
  };

  return (
    <section
      style={{
        background: "#FFFFFF",
        border: "1px solid #ECECF2",
        borderRadius: 24,
        boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
        padding: 28,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(280px, 1.1fr)", gap: 24 }}>
        <div>
          <p style={{ margin: "0 0 8px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            CONTINUITY ACCESS
          </p>
          <h2 style={{ margin: "0 0 10px 0", color: "#111827", fontSize: 30 }}>
            Share clear read-only access.
          </h2>
          <p style={{ margin: "0 0 18px 0", color: "#6B7280", fontSize: 14, lineHeight: 1.6 }}>
            Set one private continuity code, then share the link and code with trusted family members.
          </p>
          <div style={{ background: "#F4F2FF", borderRadius: 18, padding: 16 }}>
            {[
              "Set a private continuity code.",
              "Copy the family continuity link.",
              "Share both privately with trusted family members.",
              "They open the same read-only continuity view of your records.",
            ].map((step) => (
              <p key={step} style={{ margin: "0 0 8px 0", color: "#5f6b59", fontSize: 13 }}>
                {step}
              </p>
            ))}
          </div>
          <p style={{ margin: "14px 0 0 0", color: "#6B7280", fontSize: 12, lineHeight: 1.5 }}>
            MVP note: this is one shared family view. Separate access for each person will be added later after the core vault is stable.
          </p>
        </div>

        <div>
          {loading && (
            <p style={{ margin: "0 0 12px 0", color: "#6B7280", fontSize: 13 }}>
              Checking saved continuity code...
            </p>
          )}
          <p style={{ margin: "0 0 6px 0", color: "#6B7280", fontSize: 12, fontWeight: 800 }}>
            CONTINUITY ACCESS CODE
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
              padding: "14px",
              background: "#111827",
              color: "#FFFFFF",
              border: "1px solid #111827",
              cursor: saving ? "not-allowed" : "pointer",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 850,
              marginBottom: 12,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Code"}
          </button>

          {shareLink && (
            <div style={{ background: "#F4F2FF", borderRadius: 18, padding: 16, marginTop: 8 }}>
              <p style={{ margin: "0 0 8px 0", color: "#6D5EF5", fontSize: 13, fontWeight: 850 }}>
                Share with trusted family members
              </p>
              <p style={{ margin: "0 0 10px 0", color: "#6B7280", fontSize: 12, wordBreak: "break-all" }}>
                {shareLink}
              </p>
              <p style={{ margin: "0 0 12px 0", color: "#6B7280", fontSize: 13 }}>
                Code: <strong style={{ color: "#111827" }}>{pin}</strong>
              </p>
              <button
                onClick={copyLink}
                style={{
                  width: "100%",
                  padding: "11px",
                  background: "#6D5EF5",
                  color: "#FFFFFF",
                  border: "1px solid #6D5EF5",
                  cursor: "pointer",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Copy Continuity Link
              </button>
            </div>
          )}

          {message && (
            <p
              style={{
                color: message.startsWith("Failed") || message.startsWith("Could not") ? "#EF4444" : "#6D5EF5",
                fontSize: 14,
                marginTop: 10,
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default FamilySettings;
