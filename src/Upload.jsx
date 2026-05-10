/* eslint-disable */
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { supabase } from "./supabase";

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
    padding: "13px 15px",
    background: "#fffefa",
    border: "1px solid rgba(93,111,86,0.2)",
    borderRadius: 16,
    color: "#171b14",
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
        const encrypted = CryptoJS.AES.encrypt(e.target.result, encryptionKey).toString();
        const encryptedBlob = new Blob([encrypted], { type: "text/plain" });
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filePath = `${userId}/${Date.now()}_${cleanName}.enc`;
        const { error } = await supabase.storage.from("vault").upload(filePath, encryptedBlob);

        if (error) setMessage("Upload failed: " + error.message);
        else {
          setMessage("File encrypted and uploaded.");
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
    if (!error) setFiles(data || []);
  }

  async function handleDecrypt(fileName) {
    if (!decryptKey) return setMessage("Please enter your decryption key first.");

    setMessage("Decrypting...");
    setDecryptedContent(null);

    const { data: signedData, error: signedError } = await supabase.storage
      .from("vault")
      .createSignedUrl(`${userId}/${fileName}`, 3600);

    if (signedError) {
      setMessage("Failed to get file access: " + signedError.message);
      return;
    }

    const response = await fetch(signedData.signedUrl);
    const encryptedText = await response.text();

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, decryptKey);
      const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) return setMessage("Wrong decryption key.");
      setDecryptedContent(decryptedData);
      setDecryptedFileName(fileName.replace(".enc", ""));
      setMessage("File decrypted successfully.");
    } catch (err) {
      setMessage("Decryption failed: " + err.message);
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
      <section>
        <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
          SECURE UPLOAD
        </p>
        <h2 style={{ margin: "0 0 10px 0", color: "#171b14", fontSize: 28 }}>Upload File</h2>
        <p style={{ margin: "0 0 18px 0", color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
          Encrypted locally before upload. Keep your encryption key safely.
        </p>
        <input
          type="password"
          placeholder="Encryption key"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          style={inputStyle}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ ...inputStyle, cursor: "pointer" }} />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            width: "100%",
            padding: "14px",
            background: "#171b14",
            color: "#fffefa",
            border: "1px solid #171b14",
            cursor: uploading ? "not-allowed" : "pointer",
            borderRadius: 999,
            fontSize: 15,
            fontWeight: 850,
          }}
        >
          {uploading ? "Encrypting and uploading..." : "Encrypt and Upload"}
        </button>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ margin: 0, color: "#171b14", fontSize: 28 }}>Your Files</h2>
          <button
            onClick={fetchFiles}
            style={{
              padding: "8px 14px",
              background: "#f4f2e9",
              color: "#5f6b59",
              border: "1px solid rgba(93,111,86,0.16)",
              cursor: "pointer",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Refresh
          </button>
        </div>
        <input
          type="password"
          placeholder="Decryption key to unlock files"
          value={decryptKey}
          onChange={(e) => setDecryptKey(e.target.value)}
          style={inputStyle}
        />
        {files.length === 0 && <p style={{ color: "#6f766a", fontSize: 14 }}>No files uploaded yet.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {files.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: "#f7f6f0",
                border: "1px solid rgba(93,111,86,0.12)",
                borderRadius: 16,
              }}
            >
              <span style={{ color: "#6f766a", fontSize: 13, overflowWrap: "anywhere" }}>{item.name}</span>
              <button
                onClick={() => handleDecrypt(item.name)}
                style={{
                  padding: "8px 13px",
                  background: "#7f9278",
                  color: "#fffefa",
                  border: "1px solid #7f9278",
                  cursor: "pointer",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                Decrypt
              </button>
            </div>
          ))}
        </div>

        {decryptedContent && (
          <div style={{ marginTop: 16, padding: 16, background: "#eef4ea", borderRadius: 18 }}>
            <p style={{ color: "#5f7359", margin: "0 0 4px 0", fontSize: 14, fontWeight: 800 }}>
              Ready: {decryptedFileName}
            </p>
            <button
              onClick={handleDownload}
              style={{
                width: "100%",
                padding: "11px",
                background: "#171b14",
                color: "#fffefa",
                border: "1px solid #171b14",
                cursor: "pointer",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Download Decrypted File
            </button>
          </div>
        )}

        {message && (
          <p style={{ color: message.includes("success") || message.includes("uploaded") ? "#5f7359" : "#b8554f", marginTop: 12, fontSize: 14 }}>
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

export default Upload;
