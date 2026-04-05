/* eslint-disable */
import { useState } from "react";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

export default function RecoveryPhrase({ onConfirmed }) {
  const [phrase] = useState(() => bip39.generateMnemonic(wordlist, 256));
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(phrase);
    setCopied(true);
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 24 }}>
      <h2>⚠️ Your Recovery Phrase</h2>
      <p style={{ color: "red" }}>
        Write this down. If you lose it, your data{" "}
        <strong>cannot be recovered</strong>. We do not store this.
      </p>

      <div
        style={{
          background: "#f4f4f4",
          padding: 16,
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 15,
          lineHeight: 2,
          wordSpacing: 8,
        }}
      >
        {phrase}
      </div>

      <button onClick={handleCopy} style={{ marginTop: 12 }}>
        {copied ? "✅ Copied!" : "Copy Phrase"}
      </button>

      <div style={{ marginTop: 20 }}>
        <label>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />{" "}
          I have safely written down / saved my 24-word recovery phrase
        </label>
      </div>

      <button
        onClick={onConfirmed}
        disabled={!checked}
        style={{
          marginTop: 16,
          opacity: checked ? 1 : 0.4,
          cursor: checked ? "pointer" : "not-allowed",
        }}
      >
        Continue to Vault →
      </button>
    </div>
  );
}
