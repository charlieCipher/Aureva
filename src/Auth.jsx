/* eslint-disable */
import { useState } from "react";
import { supabase } from "./supabase";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingVerification, setWaitingVerification] = useState(false);

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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else {
        localStorage.setItem("show_recovery_phrase", "true");
        setWaitingVerification(true);
      }
    }
    setLoading(false);
  }

  if (waitingVerification) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            padding: 40,
            borderRadius: 16,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "#0f172a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
              border: "2px solid #6366f1",
            }}
          >
            <span style={{ fontSize: 36 }}>&#128272;</span>
          </div>

          <h2 style={{ margin: "0 0 8px 0", color: "white", fontSize: 22 }}>
            Activate Your Vault
          </h2>
          <p
            style={{
              margin: "0 0 24px 0",
              color: "#64748b",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            We sent a secure verification link to
          </p>
          <div
            style={{
              background: "#0f172a",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 24,
              display: "inline-block",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6366f1",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              {email}
            </p>
          </div>

          <div
            style={{
              background: "#0f172a",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 12px 0",
                color: "#64748b",
                fontSize: 12,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              WHAT HAPPENS NEXT
            </p>
            {[
              { icon: "&#128231;", text: "Open the email from Aureva" },
              { icon: "&#128279;", text: "Click the verification link" },
              { icon: "&#128272;", text: "Your recovery phrase will be shown" },
              { icon: "&#9989;", text: "Your secure vault is ready" },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{ fontSize: 20 }}
                  dangerouslySetInnerHTML={{ __html: step.icon }}
                />
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#1c1107",
              border: "1px solid #f59e0b",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <p style={{ margin: 0, color: "#f59e0b", fontSize: 12 }}>
              Check your spam folder if you don't see the email in 2 minutes
            </p>
          </div>

          <button
            onClick={async () => {
              const { error } = await supabase.auth.resend({
                type: "signup",
                email,
              });
              if (!error) setMessage("Verification email resent!");
              else setMessage("Failed to resend. Try again.");
            }}
            style={{
              width: "100%",
              padding: "12px",
              background: "#334155",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            Resend Verification Email
          </button>

          <p
            onClick={() => {
              setWaitingVerification(false);
              setIsLogin(true);
            }}
            style={{
              margin: 0,
              color: "#6366f1",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Already verified? Login here
          </p>

          {message && (
            <p style={{ color: "#10b981", fontSize: 13, marginTop: 12 }}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: 40,
          borderRadius: 12,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ margin: "0 0 4px 0", color: "#6366f1", fontSize: 28 }}>
          Continuum
        </h1>
        <p style={{ margin: "0 0 32px 0", color: "#64748b", fontSize: 14 }}>
          Your secure legacy vault
        </p>

        <h2 style={{ margin: "0 0 20px 0", color: "white", fontSize: 20 }}>
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: 12,
            padding: "12px",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 6,
            color: "white",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: 20,
            padding: "12px",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: 6,
            color: "white",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#6366f1",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <p
          style={{
            marginTop: 16,
            color: "#6366f1",
            cursor: "pointer",
            textAlign: "center",
            fontSize: 14,
          }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "No account? Sign up" : "Have an account? Login"}
        </p>

        {message && (
          <p
            style={{
              color: "#ef4444",
              textAlign: "center",
              fontSize: 13,
              marginTop: 12,
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;
