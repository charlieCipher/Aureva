/* eslint-disable */
import { useState } from "react";
import { supabase } from "./supabase";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      }
    }
    setLoading(false);
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
          🔐 Continuum
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
