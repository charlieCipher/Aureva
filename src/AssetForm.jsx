/* eslint-disable */
import { useState } from "react";
import { supabase } from "./supabase";
import CryptoJS from "crypto-js";

function AssetForm({ session, onAssetAdded }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Insurance");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function uploadFile() {
    if (!file) return null;
    if (!encryptionKey) {
      setMessage("Please enter an encryption key to attach a file.");
      return null;
    }

    return new Promise((resolve) => {
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
        const filePath = `${session.user.id}/${timestamp}_${cleanName}.enc`;

        const { error } = await supabase.storage
          .from("vault")
          .upload(filePath, encryptedBlob);

        if (error) {
          setMessage("File upload failed: " + error.message);
          resolve(null);
        } else {
          resolve(filePath);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleSubmit() {
    if (!title) return setMessage("Please enter a title.");

    setLoading(true);
    setMessage("");

    let filePath = null;
    if (file) {
      filePath = await uploadFile();
      if (file && !filePath) {
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("assets")
      .insert([
        {
          user_id: session.user.id,
          title,
          type,
          description,
          instructions,
          file_path: filePath,
        },
      ])
      .select();

    if (error) {
      setMessage("Failed to save: " + error.message);
    } else {
      setMessage("Asset saved! ✅");
      setTitle("");
      setType("Insurance");
      setDescription("");
      setInstructions("");
      setFile(null);
      setEncryptionKey("");
      if (onAssetAdded) onAssetAdded(data[0]);
    }

    setLoading(false);
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
      <h2 style={{ margin: "0 0 20px 0", color: "white", fontSize: 18 }}>
        ➕ Add Asset
      </h2>

      <input
        type="text"
        placeholder="Title (e.g. LIC Policy)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
        name="asset-title"
        style={inputStyle}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        <option value="Insurance">Insurance</option>
        <option value="Bank">Bank</option>
        <option value="Document">Document</option>
        <option value="Property">Property</option>
        <option value="Investment">Investment</option>
        <option value="Other">Other</option>
      </select>

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      <textarea
        placeholder="📋 What should your family do? (e.g. Contact LIC branch with death certificate and policy number)"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: "vertical", borderColor: "#6366f1" }}
      />

      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
        📎 Attach a file (optional)
      </p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ ...inputStyle, cursor: "pointer" }}
      />

      {file && (
        <input
          type="password"
          placeholder="Encryption key for this file"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          style={inputStyle}
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
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
        {loading ? "Saving..." : "➕ Add Asset"}
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
  );
}

export default AssetForm;
