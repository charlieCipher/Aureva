/* eslint-disable */
import { useState } from "react";
import { supabase } from "./supabase";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isFamilyLogin, setIsFamilyLogin] = useState(false);
  const [familyCode, setFamilyCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingVerification, setWaitingVerification] = useState(false);

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: "14px 16px",
    background: "#FFFFFF",
    border: "1px solid #ECECF2",
    borderRadius: 16,
    color: "#111827",
    fontSize: 15,
    boxSizing: "border-box",
  };

  async function handleAuth() {
    setMessage("");
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
    } else {
      if (password.length < 8) {
        setMessage("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            needs_recovery_phrase: true,
          },
        },
      });

      if (error) setMessage(error.message);
      else setWaitingVerification(true);
    }

    setLoading(false);
  }

  async function handleFamilyLogin() {
    const code = familyCode.trim();

    if (code.length < 4) {
      setMessage("Enter the continuity code shared with you.");
      return;
    }

    setMessage("");
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("family_code", code)
      .limit(1);

    setLoading(false);

    if (error || !data || data.length === 0) {
      setMessage("Invalid continuity code.");
      return;
    }

    sessionStorage.setItem("family_access_pin", code);
    window.location.href = `/family#${data[0].id}`;
  }

  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(255,255,250,0.95), transparent 32rem), linear-gradient(135deg, #e6ecdf 0%, #f8f7f1 50%, #dfe8dc 100%)",
    display: "grid",
    placeItems: "center",
    padding: 24,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  if (waitingVerification) {
    return (
      <div style={pageStyle}>
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#FFFFFF",
            border: "1px solid #ECECF2",
            borderRadius: 28,
            padding: 34,
            boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 10px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            VERIFY EMAIL
          </p>
          <h2 style={{ margin: "0 0 10px 0", color: "#111827", fontSize: 32 }}>
            Activate Your Family Vault
          </h2>
          <p style={{ margin: "0 0 18px 0", color: "#6B7280", fontSize: 14, lineHeight: 1.6 }}>
            We sent a secure verification link to <strong>{email}</strong>.
          </p>

          <div
            style={{
              background: "#F4F2FF",
              borderRadius: 18,
              padding: 18,
              marginBottom: 18,
              textAlign: "left",
            }}
          >
            {[
              "Open the email from Aureva.",
              "Click the verification link.",
              "Save your Family Recovery Key.",
              "Start building your legacy workspace.",
            ].map((step) => (
              <p key={step} style={{ margin: "0 0 8px 0", color: "#5f6b59", fontSize: 14 }}>
                {step}
              </p>
            ))}
          </div>

          <button
            onClick={async () => {
              const { error } = await supabase.auth.resend({
                type: "signup",
                email,
              });
              setMessage(error ? "Failed to resend. Try again." : "Verification email resent.");
            }}
            style={{
              width: "100%",
              padding: "13px",
              background: "#111827",
              color: "#FFFFFF",
              border: "1px solid #111827",
              cursor: "pointer",
              borderRadius: 999,
              fontWeight: 800,
            }}
          >
            Resend Verification Email
          </button>

          <p
            onClick={() => {
              setWaitingVerification(false);
              setIsLogin(true);
            }}
            style={{ margin: "16px 0 0 0", color: "#6D5EF5", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          >
            Already verified? Login here
          </p>

          {message && <p style={{ color: "#6D5EF5", fontSize: 13, marginTop: 12 }}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div
        style={{
          width: "100%",
          maxWidth: 1040,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 430px)",
          gap: 28,
          alignItems: "stretch",
        }}
      >
        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(93,111,86,0.14)",
            borderRadius: 32,
            padding: 44,
            boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 520,
          }}
        >
          <div>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 17,
                background: "#111827",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                marginBottom: 24,
              }}
            >
              A
            </div>
            <p style={{ margin: "0 0 8px 0", color: "#111827", fontSize: 22, fontWeight: 900 }}>
              Aureva
            </p>
            <p style={{ margin: "0 0 14px 0", color: "#6D5EF5", fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>
              SECURE LEGACY CONTINUITY VAULT
            </p>
            <h1 style={{ margin: 0, color: "#111827", fontSize: 58, lineHeight: 1.02, letterSpacing: 0 }}>
              Your legacy is protected.
            </h1>
            <p style={{ margin: "18px 0 0 0", color: "#6B7280", fontSize: 16, lineHeight: 1.7, maxWidth: 560 }}>
              Protect critical personal, legal, financial, emotional, and family information
              for future generations.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 36 }}>
            {["Continuity Records", "Shared Family View", "Continuity Export"].map((item) => (
              <div key={item} style={{ background: "#F4F2FF", borderRadius: 18, padding: 16 }}>
                <p style={{ margin: 0, color: "#111827", fontWeight: 850 }}>{item}</p>
                <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: 12 }}>Protected clearly</p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #ECECF2",
            borderRadius: 32,
            padding: 34,
            boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: 30 }}>
            {isFamilyLogin ? "Continuity access" : isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ margin: "0 0 24px 0", color: "#6B7280", fontSize: 14, lineHeight: 1.6 }}>
            {isFamilyLogin
              ? "Use the continuity code shared by your family member."
              : isLogin
                ? "Trusted device login. Unlock your vault with your current method."
                : "New device setup. Email, password, and recovery verification protect the vault."}
          </p>

          {isFamilyLogin ? (
            <input
              type="password"
              placeholder="Continuity access code"
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFamilyLogin()}
              style={{ ...inputStyle, letterSpacing: 3, textAlign: "center" }}
            />
          ) : (
            <>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              {isLogin && (
                <div style={{ background: "#F4F2FF", borderRadius: 18, padding: 14, marginBottom: 14 }}>
                  <p style={{ margin: "0 0 10px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
                    UNLOCK METHODS
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["Password", "Passkey ready", "Windows Hello ready", "Recovery wizard"].map((method) => (
                      <span
                        key={method}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 999,
                          background: "#FFFFFF",
                          border: "1px solid #ECECF2",
                          color: "#111827",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={isFamilyLogin ? handleFamilyLogin : handleAuth}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "#111827",
              color: "#FFFFFF",
              border: "1px solid #111827",
              cursor: loading ? "not-allowed" : "pointer",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 850,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : isFamilyLogin ? "Open Continuity View" : isLogin ? "Login" : "Sign Up"}
          </button>

          {!isFamilyLogin && (
            <p
              style={{ marginTop: 16, color: "#6D5EF5", cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 750 }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "No account? Sign up" : "Have an account? Login"}
            </p>
          )}

          <p
            style={{
              marginTop: isFamilyLogin ? 16 : 8,
              color: "#6B7280",
              cursor: "pointer",
              textAlign: "center",
              fontSize: 14,
            }}
            onClick={() => {
              setMessage("");
              setIsFamilyLogin(!isFamilyLogin);
            }}
          >
            {isFamilyLogin ? "Back to owner sign in" : "Sign in as family"}
          </p>

          {message && (
            <p style={{ color: "#EF4444", textAlign: "center", fontSize: 13, marginTop: 14 }}>
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Auth;
