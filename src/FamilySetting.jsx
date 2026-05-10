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

      if (error) setMessage("Could not load existing PIN. You can still set a new one.");

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
      setMessage("PIN must be at least 4 characters.");
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
      setMessage("PIN saved.");
      setShareLink(`${window.location.origin}/family#${session.user.id}`);
    }

    setSaving(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink);
    setMessage("Link copied. Share this link and PIN privately with family.");
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: "13px 15px",
    background: "#fffefa",
    border: "1px solid rgba(93,111,86,0.2)",
    borderRadius: 16,
    color: "#171b14",
    fontSize: 16,
    boxSizing: "border-box",
    letterSpacing: 4,
  };

  return (
    <section
      style={{
        background: "rgba(255,255,250,0.88)",
        border: "1px solid rgba(93,111,86,0.16)",
        borderRadius: 24,
        boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
        padding: 28,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.9fr) minmax(280px, 1.1fr)", gap: 24 }}>
        <div>
          <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            FAMILY VIEW
          </p>
          <h2 style={{ margin: "0 0 10px 0", color: "#171b14", fontSize: 30 }}>
            Share clear read-only access.
          </h2>
          <p style={{ margin: "0 0 18px 0", color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
            Set one private family PIN, then share the link and PIN with trusted people.
          </p>
          <div style={{ background: "#f4f2e9", borderRadius: 18, padding: 16 }}>
            {[
              "Set a private family PIN.",
              "Copy the family access link.",
              "Share both privately with your family.",
              "They open a read-only view of your records.",
            ].map((step) => (
              <p key={step} style={{ margin: "0 0 8px 0", color: "#5f6b59", fontSize: 13 }}>
                {step}
              </p>
            ))}
          </div>
        </div>

        <div>
          {loading && (
            <p style={{ margin: "0 0 12px 0", color: "#6f766a", fontSize: 13 }}>
              Checking saved PIN...
            </p>
          )}
          <p style={{ margin: "0 0 6px 0", color: "#6f766a", fontSize: 12, fontWeight: 800 }}>
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
              padding: "14px",
              background: "#171b14",
              color: "#fffefa",
              border: "1px solid #171b14",
              cursor: saving ? "not-allowed" : "pointer",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 850,
              marginBottom: 12,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save PIN"}
          </button>

          {shareLink && (
            <div style={{ background: "#f4f2e9", borderRadius: 18, padding: 16, marginTop: 8 }}>
              <p style={{ margin: "0 0 8px 0", color: "#5f7359", fontSize: 13, fontWeight: 850 }}>
                Share with your family
              </p>
              <p style={{ margin: "0 0 10px 0", color: "#6f766a", fontSize: 12, wordBreak: "break-all" }}>
                {shareLink}
              </p>
              <p style={{ margin: "0 0 12px 0", color: "#6f766a", fontSize: 13 }}>
                PIN: <strong style={{ color: "#171b14" }}>{pin}</strong>
              </p>
              <button
                onClick={copyLink}
                style={{
                  width: "100%",
                  padding: "11px",
                  background: "#7f9278",
                  color: "#fffefa",
                  border: "1px solid #7f9278",
                  cursor: "pointer",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Copy Family Link
              </button>
            </div>
          )}

          {message && (
            <p
              style={{
                color: message.startsWith("Failed") || message.startsWith("Could not") ? "#b8554f" : "#5f7359",
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
