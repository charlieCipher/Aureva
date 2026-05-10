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
    background: "#fffefa",
    border: "1px solid rgba(93,111,86,0.2)",
    borderRadius: 16,
    color: "#171b14",
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
      setMessage("Enter the family access code shared with you.");
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
      setMessage("Invalid family access code.");
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
            background: "rgba(255,255,250,0.9)",
            border: "1px solid rgba(93,111,86,0.16)",
            borderRadius: 28,
            padding: 34,
            boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 10px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            VERIFY EMAIL
          </p>
          <h2 style={{ margin: "0 0 10px 0", color: "#171b14", fontSize: 32 }}>
            Activate Your Family Vault
          </h2>
          <p style={{ margin: "0 0 18px 0", color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
            We sent a secure verification link to <strong>{email}</strong>.
          </p>

          <div
            style={{
              background: "#f4f2e9",
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
              background: "#171b14",
              color: "#fffefa",
              border: "1px solid #171b14",
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
            style={{ margin: "16px 0 0 0", color: "#5f7359", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          >
            Already verified? Login here
          </p>

          {message && <p style={{ color: "#5f7359", fontSize: 13, marginTop: 12 }}>{message}</p>}
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
            background: "rgba(255,255,250,0.72)",
            border: "1px solid rgba(93,111,86,0.14)",
            borderRadius: 32,
            padding: 44,
            boxShadow: "0 24px 60px rgba(58,69,52,0.12)",
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
                background: "#171b14",
                color: "#fffefa",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                marginBottom: 24,
              }}
            >
              A
            </div>
            <p style={{ margin: "0 0 14px 0", color: "#7f9278", fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>
              AUREVA
            </p>
            <h1 style={{ margin: 0, color: "#171b14", fontSize: 58, lineHeight: 1.02, letterSpacing: 0 }}>
              Legacy planning that feels calm.
            </h1>
            <p style={{ margin: "18px 0 0 0", color: "#6f766a", fontSize: 16, lineHeight: 1.7, maxWidth: 560 }}>
              Organize assets, instructions, and family access in one private workspace built for Indian families.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 36 }}>
            {["Assets", "Family View", "Export"].map((item) => (
              <div key={item} style={{ background: "#f4f2e9", borderRadius: 18, padding: 16 }}>
                <p style={{ margin: 0, color: "#171b14", fontWeight: 850 }}>{item}</p>
                <p style={{ margin: "4px 0 0 0", color: "#6f766a", fontSize: 12 }}>Prepared clearly</p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "rgba(255,255,250,0.9)",
            border: "1px solid rgba(93,111,86,0.16)",
            borderRadius: 32,
            padding: 34,
            boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", color: "#171b14", fontSize: 30 }}>
            {isFamilyLogin ? "Family access" : isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ margin: "0 0 24px 0", color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
            {isFamilyLogin
              ? "Use the code shared by your family member."
              : "Enter your details to continue your Aureva workspace."}
          </p>

          {isFamilyLogin ? (
            <input
              type="password"
              placeholder="Family access code"
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
            </>
          )}

          <button
            onClick={isFamilyLogin ? handleFamilyLogin : handleAuth}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: "#171b14",
              color: "#fffefa",
              border: "1px solid #171b14",
              cursor: loading ? "not-allowed" : "pointer",
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 850,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : isFamilyLogin ? "Access Family View" : isLogin ? "Login" : "Sign Up"}
          </button>

          {!isFamilyLogin && (
            <p
              style={{ marginTop: 16, color: "#5f7359", cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 750 }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "No account? Sign up" : "Have an account? Login"}
            </p>
          )}

          <p
            style={{
              marginTop: isFamilyLogin ? 16 : 8,
              color: "#6f766a",
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
            <p style={{ color: "#b8554f", textAlign: "center", fontSize: 13, marginTop: 14 }}>
              {message}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Auth;
