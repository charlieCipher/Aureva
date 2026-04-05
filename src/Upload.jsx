/* eslint-disable */
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import CryptoJS from "crypto-js";

function Upload({ session }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [decryptKey, setDecryptKey] = useState("");
  const [decryptedContent, setDecryptedContent] = useState(null);
  const [decryptedFileName, setDecryptedFileName] = useState("");

  const userId = session?.user?.id || "public";

  const inputStyle = {
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
  };

  async function handleUpload() {
    if (!file) return setMessage("Please select a file first.");
    if (!encryptionKey) return setMessage("Please enter an encryption key.");

    setUploading(true);
    setMessage("");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target.result;
        const encrypted = CryptoJS.AES.encrypt(
          fileData,
          encryptionKey,
        ).toString();
        const encryptedBlob = new Blob([encrypted], { type: "text/plain" });

        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const timestamp = Date.now();
        const filePath = `${userId}/${timestamp}_${cleanName}.enc`;

        const { error } = await supabase.storage
          .from("vault")
          .upload(filePath, encryptedBlob);

        if (error) {
          setMessage("Upload failed: " + error.message);
        } else {
          setMessage("File encrypted and uploaded! ✅");
          fetchFiles();
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setMessage("Error: " + err.message);
      setUploading(false);
    }
  }

  async function fetchFiles() {
    const { data, error } = await supabase.storage.from("vault").list(userId);
    if (error) {
      console.error("FETCH ERROR:", error);
    } else {
      setFiles(data || []);
    }
  }

  async function handleDecrypt(fileName) {
    if (!decryptKey)
      return setMessage("Please enter your decryption key first.");

    setMessage("Decrypting...");
    setDecryptedContent(null);

    const filePath = `${userId}/${fileName}`;

    // ✅ Use signed URL instead of public URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from("vault")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedError) {
      setMessage("Failed to get file access: " + signedError.message);
      return;
    }

    // Download using signed URL
    const response = await fetch(signedData.signedUrl);
    const encryptedText = await response.text();

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, decryptKey);
      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        setMessage("❌ Wrong decryption key!");
        return;
      }

      setDecryptedContent(decryptedData);
      setDecryptedFileName(fileName.replace(".enc", ""));
      setMessage("File decrypted successfully! ✅");
    } catch (err) {
      setMessage("❌ Decryption failed: " + err.message);
    }
  }

  function handleDownload() {
    if (!decryptedContent) return;
    const link = document.createElement("a");
    link.href = decryptedContent;
    link.download = decryptedFileName;
    link.click();
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div style={{ fontFamily: "Arial" }}>
      {/* Upload Section */}
      <div
        style={{
          background: "#1e293b",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: "0 0 4px 0", color: "white", fontSize: 18 }}>
          📤 Upload File
        </h2>
        <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: 12 }}>
          🔒 Encrypted on your device using AES-256
        </p>
        <input
          type="password"
          placeholder="Encryption key (remember this!)"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          style={inputStyle}
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ ...inputStyle, cursor: "pointer" }}
        />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#6366f1",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 15,
            fontWeight: "bold",
          }}
        >
          {uploading ? "Encrypting & Uploading..." : "🔒 Encrypt & Upload"}
        </button>

        {message && (
          <p
            style={{
              color: message.includes("✅") ? "#10b981" : "#ef4444",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* Files Section */}
      <div style={{ background: "#1e293b", borderRadius: 12, padding: 24 }}>
        <h2 style={{ margin: "0 0 16px 0", color: "white", fontSize: 18 }}>
          📁 Your Files
        </h2>
        <input
          type="password"
          placeholder="Decryption key to unlock files"
          value={decryptKey}
          onChange={(e) => setDecryptKey(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={fetchFiles}
          style={{
            marginBottom: 16,
            padding: "8px 16px",
            background: "#334155",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          🔄 Refresh
        </button>

        {files.length === 0 && (
          <p style={{ color: "#64748b", fontSize: 14 }}>
            No files uploaded yet.
          </p>
        )}

        {files.map((f) => (
          <div
            key={f.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: "#0f172a",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: 13 }}>🔒 {f.name}</span>
            <button
              onClick={() => handleDecrypt(f.name)}
              style={{
                padding: "6px 14px",
                background: "#10b981",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              Decrypt
            </button>
          </div>
        ))}

        {decryptedContent && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "#0f172a",
              borderRadius: 8,
              border: "1px solid #10b981",
            }}
          >
            <p style={{ color: "#10b981", margin: "0 0 4px 0", fontSize: 14 }}>
              ✅ Ready: {decryptedFileName}
            </p>
            <p style={{ color: "#64748b", margin: "0 0 12px 0", fontSize: 11 }}>
              🔒 Decrypted locally on your device
            </p>
            <button
              onClick={handleDownload}
              style={{
                width: "100%",
                padding: "10px",
                background: "#6366f1",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              ⬇️ Download Decrypted File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
