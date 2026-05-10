/* eslint-disable */
import { useState } from "react";
import CryptoJS from "crypto-js";
import { supabase } from "./supabase";

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
    padding: "13px 15px",
    background: "#fffefa",
    border: "1px solid rgba(93,111,86,0.2)",
    borderRadius: 16,
    color: "#171b14",
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
        const encrypted = CryptoJS.AES.encrypt(e.target.result, encryptionKey).toString();
        const encryptedBlob = new Blob([encrypted], { type: "text/plain" });
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const filePath = `${session.user.id}/${Date.now()}_${cleanName}.enc`;
        const { error } = await supabase.storage.from("vault").upload(filePath, encryptedBlob);

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
      if (!filePath) {
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
      setMessage("Asset saved.");
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
    <section
      style={{
        background: "rgba(255,255,250,0.88)",
        border: "1px solid rgba(93,111,86,0.16)",
        borderRadius: 24,
        boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
        padding: 28,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
        <div>
          <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            NEW RECORD
          </p>
          <h2 style={{ margin: 0, color: "#171b14", fontSize: 28 }}>Add Asset</h2>
        </div>
        <p style={{ margin: 0, color: "#6f766a", fontSize: 13, maxWidth: 320, lineHeight: 1.5 }}>
          Capture what exists, where it is, and what your family should do.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <input
          type="text"
          placeholder="Title, e.g. LIC Policy"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
          name="asset-title"
          style={inputStyle}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="Insurance">Insurance</option>
          <option value="Bank">Bank</option>
          <option value="Document">Document</option>
          <option value="Property">Property</option>
          <option value="Investment">Investment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <textarea
        placeholder="Description, account number hint, location, or branch details"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />
      <textarea
        placeholder="What should your family do? Example: Contact LIC branch with death certificate and policy number."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: "vertical", borderColor: "rgba(127,146,120,0.55)" }}
      />

      <div style={{ background: "#f4f2e9", borderRadius: 18, padding: 16, marginBottom: 14 }}>
        <p style={{ margin: "0 0 10px 0", color: "#5f6b59", fontSize: 13, fontWeight: 800 }}>
          Optional encrypted file
        </p>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ ...inputStyle, cursor: "pointer" }} />
        {file && (
          <input
            type="password"
            placeholder="Encryption key for this file"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            style={inputStyle}
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
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
        {loading ? "Saving..." : "Add Asset"}
      </button>

      {message && (
        <p
          style={{
            color: message.includes("saved") ? "#5f7359" : "#b8554f",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          {message}
        </p>
      )}
    </section>
  );
}

export default AssetForm;
