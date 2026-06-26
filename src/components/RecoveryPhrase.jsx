/* eslint-disable */
import { useState } from "react";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { jsPDF } from "jspdf";

export default function RecoveryPhrase({ onConfirmed }) {
  const [phrase] = useState(() => bip39.generateMnemonic(wordlist, 128));
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(phrase);
    setCopied(true);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Aureva Family Recovery Key", 20, 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Keep this 12-word phrase offline and private.", 20, 36);
    doc.text("If you lose it, Aureva cannot recover your encrypted data.", 20, 44);
    doc.setFont("courier", "bold");
    doc.setFontSize(13);
    const lines = doc.splitTextToSize(phrase, 170);
    doc.text(lines, 20, 62);
    doc.save("Aureva_Recovery_Key.pdf");
  };

  const printKey = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Aureva Recovery Key</title></head>
        <body style="font-family: Arial; padding: 40px;">
          <h1>Aureva Family Recovery Key</h1>
          <p>Keep this 12-word phrase offline and private.</p>
          <p><strong>If you lose it, Aureva cannot recover your encrypted data.</strong></p>
          <div style="font-family: monospace; font-size: 18px; line-height: 2; border: 1px solid #ccc; padding: 20px;">
            ${phrase}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 12% 8%, rgba(255,255,250,0.95), transparent 32rem), linear-gradient(135deg, #e6ecdf 0%, #f8f7f1 50%, #dfe8dc 100%)",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          background: "#FFFFFF",
          border: "1px solid #ECECF2",
          borderRadius: 28,
          padding: 34,
          boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            color: "#6D5EF5",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          ONE-TIME SECURITY STEP
        </p>
        <h2 style={{ margin: "0 0 10px 0", fontSize: 30, color: "#111827" }}>
          Save Your Family Recovery Key
        </h2>
        <p style={{ margin: "0 0 18px 0", color: "#6B7280", fontSize: 14, lineHeight: 1.65 }}>
          This 12-word recovery phrase protects access to your encrypted continuity vault.
          If you lose this recovery phrase, Aureva cannot recover your data.
        </p>

        <div
          style={{
            background: "#F4F2FF",
            border: "1px solid #ECECF2",
            padding: 18,
            borderRadius: 18,
            fontFamily: "ui-monospace, Consolas, monospace",
            fontSize: 15,
            lineHeight: 2,
            wordSpacing: 8,
            color: "#111827",
          }}
        >
          {phrase}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginTop: 14 }}>
          <button
            onClick={handleCopy}
            style={{
              padding: "12px",
              background: copied ? "#6D5EF5" : "#111827",
              color: "#FFFFFF",
              border: "1px solid #111827",
              cursor: "pointer",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 850,
            }}
          >
            {copied ? "Copied" : "Copy Key"}
          </button>
          <button
            onClick={downloadPDF}
            style={{
              padding: "12px",
              background: "#FFFFFF",
              color: "#111827",
              border: "1px solid rgba(93,111,86,0.22)",
              cursor: "pointer",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 850,
            }}
          >
            Download PDF
          </button>
          <button
            onClick={printKey}
            style={{
              padding: "12px",
              background: "#FFFFFF",
              color: "#111827",
              border: "1px solid rgba(93,111,86,0.22)",
              cursor: "pointer",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 850,
            }}
          >
            Print
          </button>
        </div>

        <label
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            color: "#5f6b59",
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
          I have safely saved my 12-word Family Recovery Key.
        </label>

        <button
          onClick={onConfirmed}
          disabled={!checked}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px",
            background: "#111827",
            color: "#FFFFFF",
            border: "1px solid #111827",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 850,
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
