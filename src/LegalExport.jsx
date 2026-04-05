/* eslint-disable */
import { useState } from "react";
import { jsPDF } from "jspdf";

function LegalExport({ assets, userEmail }) {
  const [generating, setGenerating] = useState(false);

  const typeIcons = {
    Insurance: "Shield",
    Bank: "Bank",
    Document: "Document",
    Property: "Property",
    Investment: "Investment",
    Other: "Other",
  };

  async function generatePDF() {
    setGenerating(true);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper functions
    function addText(text, x, fontSize, color, isBold) {
      doc.setFontSize(fontSize);
      doc.setTextColor(...color);
      if (isBold) doc.setFont("helvetica", "bold");
      else doc.setFont("helvetica", "normal");
      doc.text(text, x, y);
    }

    function checkNewPage(neededSpace) {
      if (y + neededSpace > 270) {
        doc.addPage();
        y = 20;
      }
    }

    function drawLine() {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    }

    // ---- HEADER ----
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("CONTINUUM", margin, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Secure Legacy Vault — Asset Summary", margin, 27);
    doc.text("Confidential Document", margin, 34);

    y = 50;

    // ---- OWNER INFO ----
    addText("Document Owner", margin, 10, [100, 116, 139], false);
    y += 6;
    addText(userEmail, margin, 13, [30, 30, 30], true);
    y += 6;
    addText(
      "Generated: " +
        new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      margin,
      10,
      [100, 116, 139],
      false,
    );
    y += 10;
    drawLine();

    // ---- DISCLAIMER ----
    doc.setFillColor(255, 247, 230);
    doc.rect(margin, y, contentWidth, 22, "F");
    doc.setFontSize(9);
    doc.setTextColor(180, 100, 0);
    doc.setFont("helvetica", "bold");
    doc.text("IMPORTANT DISCLAIMER", margin + 4, y + 7);
    doc.setFont("helvetica", "normal");
    const disclaimer =
      "This document provides structured guidance only. It does NOT replace a registered legal will. Always consult a qualified legal professional for asset transfer and estate planning.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 8);
    doc.text(disclaimerLines, margin + 4, y + 13);
    y += 28;

    // ---- SUMMARY ----
    addText("ASSET SUMMARY", margin, 11, [99, 102, 241], true);
    y += 7;

    const types = [...new Set(assets.map((a) => a.type))];
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Assets: ${assets.length}`, margin, y);
    y += 6;
    doc.text(`Types: ${types.join(", ")}`, margin, y);
    y += 6;
    doc.text(
      `Assets with Instructions: ${assets.filter((a) => a.instructions).length}`,
      margin,
      y,
    );
    y += 6;
    doc.text(
      `Assets with Documents: ${assets.filter((a) => a.file_path).length}`,
      margin,
      y,
    );
    y += 12;
    drawLine();

    // ---- ASSETS ----
    addText("ASSET DETAILS", margin, 11, [99, 102, 241], true);
    y += 10;

    assets.forEach((asset, index) => {
      checkNewPage(60);

      // Asset number + title
      doc.setFillColor(240, 240, 255);
      doc.rect(margin, y - 5, contentWidth, 14, "F");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${asset.title}`, margin + 4, y + 4);

      doc.setFontSize(9);
      doc.setTextColor(99, 102, 241);
      doc.text(
        `[${asset.type}]`,
        pageWidth - margin - doc.getTextWidth(`[${asset.type}]`),
        y + 4,
      );
      y += 16;

      // Date
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Added: " + new Date(asset.created_at).toLocaleDateString("en-IN"),
        margin,
        y,
      );
      y += 7;

      // Description
      if (asset.description) {
        checkNewPage(20);
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "italic");
        const descLines = doc.splitTextToSize(asset.description, contentWidth);
        doc.text(descLines, margin, y);
        y += descLines.length * 6 + 4;
      }

      // Instructions
      if (asset.instructions) {
        checkNewPage(30);
        doc.setFillColor(245, 245, 255);
        const instrLines = doc.splitTextToSize(
          asset.instructions,
          contentWidth - 12,
        );
        const instrHeight = instrLines.length * 6 + 14;
        doc.rect(margin, y, contentWidth, instrHeight, "F");
        doc.setDrawColor(99, 102, 241);
        doc.rect(margin, y, 3, instrHeight, "F");

        doc.setFontSize(8);
        doc.setTextColor(99, 102, 241);
        doc.setFont("helvetica", "bold");
        doc.text("WHAT YOUR FAMILY SHOULD DO:", margin + 6, y + 7);

        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        doc.text(instrLines, margin + 6, y + 13);
        y += instrHeight + 6;
      }

      // File attached
      if (asset.file_path) {
        checkNewPage(12);
        doc.setFontSize(9);
        doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "italic");
        doc.text(
          "* A secure encrypted document is attached in the digital vault.",
          margin,
          y,
        );
        y += 8;
      }

      y += 6;
      if (index < assets.length - 1) drawLine();
    });

    // ---- FOOTER ----
    checkNewPage(40);
    y += 4;
    drawLine();

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");

    const footerLines = [
      "DPDP Act Note: The nominee named in physical will documents is the designated data handler — not the asset owner.",
      "This structured summary should be used alongside a registered physical will for legal execution.",
      "Generated by Continuum — Your Secure Legacy Vault",
    ];

    footerLines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, contentWidth);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 3;
    });

    // Save
    doc.save(`Continuum_Assets_${new Date().toISOString().split("T")[0]}.pdf`);
    setGenerating(false);
  }

  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <h2 style={{ margin: "0 0 8px 0", color: "white", fontSize: 18 }}>
        📜 Legal Export
      </h2>
      <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: 13 }}>
        Generate a professional PDF summary of all your assets and family
        instructions.
      </p>

      <div
        style={{
          padding: 16,
          background: "#0f172a",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            margin: "0 0 6px 0",
            color: "#f59e0b",
            fontSize: 13,
            fontWeight: "bold",
          }}
        >
          📋 PDF will include:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            "All your assets",
            "Family instructions per asset",
            "Legal disclaimer",
            "DPDP nominee note",
          ].map((item) => (
            <p key={item} style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
              ✓ {item}
            </p>
          ))}
        </div>
      </div>

      {assets.length === 0 ? (
        <p style={{ color: "#ef4444", fontSize: 13 }}>
          Add at least one asset before generating a PDF.
        </p>
      ) : (
        <button
          onClick={generatePDF}
          disabled={generating}
          style={{
            width: "100%",
            padding: "14px",
            background: generating ? "#334155" : "#6366f1",
            color: "white",
            border: "none",
            cursor: generating ? "not-allowed" : "pointer",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: "bold",
          }}
        >
          {generating ? "Generating PDF..." : "⬇️ Download Legal Export PDF"}
        </button>
      )}

      <p
        style={{
          margin: "12px 0 0 0",
          color: "#475569",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        ⚠️ This does not replace a registered legal will. Use alongside proper
        legal documentation.
      </p>
    </div>
  );
}

export default LegalExport;
