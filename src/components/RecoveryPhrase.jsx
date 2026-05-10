/* eslint-disable */
import { useState } from "react";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export default function RecoveryPhrase({ onConfirmed }) {
  const [phrase] = useState(() => bip39.generateMnemonic(wordlist, 256));
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(phrase);
    setCopied(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#1e293b",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 25px 50px rgba(0,0,0,0.45)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            color: "#818cf8",
            fontSize: 12,
            fontWeight: "bold",
            letterSpacing: 1,
          }}
        >
          IMPORTANT FAMILY SAFETY STEP
        </p>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 24 }}>
          Save Your Family Recovery Key
        </h2>
        <p
          style={{
            margin: "0 0 18px 0",
            color: "#94a3b8",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          This 24-word key protects access to your private vault. Save it in a
          safe place before continuing. Aureva cannot show it again or reset it
          for you.
        </p>

        <div
          style={{
            background: "#0f172a",
            border: "1px solid #334155",
            padding: 18,
            borderRadius: 12,
            fontFamily: "monospace",
            fontSize: 15,
            lineHeight: 2,
            wordSpacing: 8,
            color: "#e2e8f0",
          }}
        >
          {phrase}
        </div>

        <button
          onClick={handleCopy}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "12px",
            background: copied ? "#10b981" : "#334155",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          {copied ? "Copied" : "Copy Family Recovery Key"}
        </button>

        <label
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            color: "#cbd5e1",
            fontSize: 14,
            lineHeight: 1.5,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          I have safely saved my 24-word Family Recovery Key.
        </label>

        <button
          onClick={onConfirmed}
          disabled={!checked}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "13px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: "bold",
            opacity: checked ? 1 : 0.45,
            cursor: checked ? "pointer" : "not-allowed",
          }}
        >
          Continue to Aureva
        </button>
      </div>
    </div>
  );
}
