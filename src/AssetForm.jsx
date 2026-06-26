/* eslint-disable */
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { assetService } from "./modules/vault/AssetService";

function AssetForm({
  session,
  onAssetAdded,
  initialType = "",
  categoryOptions = ["Personal", "Bank", "Investment", "Legal", "Property", "Insurance", "Loan", "Other"],
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [file, setFile] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setType(initialType || "");
  }, [initialType]);

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: "13px 15px",
    background: "#FFFFFF",
    border: "1px solid #ECECF2",
    borderRadius: 16,
    color: "#111827",
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
        const { error } = await assetService.uploadEncryptedFile(filePath, encryptedBlob);

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
    const selectedType = type || initialType || "Other";

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

    const { data, error } = await assetService.createAsset({
      user_id: session.user.id,
      title,
      type: selectedType,
      description,
      instructions,
      file_path: filePath,
    });

    if (error) {
      setMessage("Failed to save: " + error.message);
    } else {
      setMessage("Continuity record saved.");
      setTitle("");
      setType(initialType || "");
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
        background: "#FFFFFF",
        border: "1px solid #ECECF2",
        borderRadius: 24,
        boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
        padding: 28,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
        <div>
          <p style={{ margin: "0 0 8px 0", color: "#6D5EF5", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
            NEW RECORD
          </p>
          <h2 style={{ margin: 0, color: "#111827", fontSize: 28 }}>Add Continuity Record</h2>
        </div>
        <p style={{ margin: 0, color: "#6B7280", fontSize: 13, maxWidth: 320, lineHeight: 1.5 }}>
          Capture what exists, where it is, and what your trusted family should do.
        </p>
      </div>

      <input
        type="text"
        placeholder="Record title, e.g. HDFC Bank Account"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoComplete="off"
        name="asset-title"
        style={inputStyle}
      />

      <div style={{ marginBottom: 12 }}>
        <p style={{ margin: "0 0 8px 0", color: "#6B7280", fontSize: 12, fontWeight: 800 }}>
          OPTIONAL SECTION
        </p>
        <p style={{ margin: "0 0 10px 0", color: "#6B7280", fontSize: 12, lineHeight: 1.45 }}>
          Choose only if this record belongs to a specific section. If you skip this, it stays under Other.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(112px, 1fr))", gap: 10 }}>
          {categoryOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              style={{
                minHeight: 46,
                borderRadius: 14,
                border: type === option ? "1px solid #6D5EF5" : "1px solid #ECECF2",
                background: type === option ? "#F0EDFF" : "#FFFFFF",
                color: type === option ? "#6D5EF5" : "#111827",
                fontWeight: 850,
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Description, account hint, document location, or branch details"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        style={{ ...inputStyle, resize: "vertical" }}
      />
      <textarea
        placeholder="Continuity instructions. Example: Tell your family where to find this record and who to contact."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        rows={4}
        style={{ ...inputStyle, resize: "vertical", borderColor: "rgba(109,94,245,0.45)" }}
      />

      <div style={{ background: "#F4F2FF", borderRadius: 18, padding: 16, marginBottom: 14 }}>
        <p style={{ margin: "0 0 10px 0", color: "#5f6b59", fontSize: 13, fontWeight: 800 }}>
          Optional encrypted supporting file
        </p>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ ...inputStyle, cursor: "pointer" }} />
        {file && (
          <input
            type="password"
            placeholder="Private encryption key for this file"
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
          background: "#111827",
          color: "#FFFFFF",
          border: "1px solid #111827",
          cursor: loading ? "not-allowed" : "pointer",
          borderRadius: 999,
          fontSize: 15,
          fontWeight: 850,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Saving..." : "Add Continuity Record"}
      </button>

      {message && (
        <p
          style={{
            color: message.includes("saved") ? "#6D5EF5" : "#EF4444",
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
