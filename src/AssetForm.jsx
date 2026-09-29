import { useRef, useState } from "react";
import { assetService } from "./modules/vault/AssetService";
import { assetRepository } from "./modules/vault/AssetRepository";
import { encryptAsset, generateIntegrityHash } from "./modules/security/crypto";
import { encryptedFile } from "./shared/utils/files";
import { errorMessage } from "./shared/utils/errors";
import Icon from "./components/Icon";
const CATEGORIES = [
  "Personal",
  "Financial",
  "Legal",
  "Medical",
  "Property",
  "Other",
];
export default function AssetForm({ session, onAssetAdded, onCancel }) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const data = new FormData(event.currentTarget);
    const secret = data.get("secret");
    if (secret !== data.get("confirm"))
      return setNotice(
        "The vault secrets don’t match. Please check both fields.",
      );
    if (!data.get("title").trim())
      return setNotice("Give this record a title.");
    submitting.current = true;
    setBusy(true);
    setNotice("");
    let filePath = null;
    let saved = false;
    try {
      const file = data.get("attachment");
      if (file?.size) {
        const blob = await encryptedFile(file, secret);
        filePath = `${session.user.id}/${crypto.randomUUID()}.enc`;
        const upload = await assetService.uploadEncryptedFile(filePath, blob);
        if (upload.error) {
          filePath = null;
          throw upload.error;
        }
      }
      const encrypted_payload = await encryptAsset(
        {
          description: data.get("description"),
          instructions: data.get("instructions"),
          file_name: file?.size ? file.name : null,
        },
        secret,
      );
      const integrity_hash = await generateIntegrityHash(encrypted_payload);
      const result = await assetService.createAsset({
        user_id: session.user.id,
        title: data.get("title").trim(),
        category: data.get("category"),
        encrypted_payload,
        integrity_hash,
        encryption_version: "aureva-v4-aes-gcm",
        file_path: filePath,
      });
      if (result.error) throw result.error;
      saved = true;
      onAssetAdded(result.data[0]);
    } catch (error) {
      let message = errorMessage(error);
      if (filePath && !saved) {
        try {
          const cleanup = await assetRepository.removeFile(filePath);
          if (cleanup.error)
            message +=
              " An encrypted attachment remains in storage; contact support to remove it.";
        } catch {
          message += " The uploaded encrypted attachment could not be removed.";
        }
      }
      setNotice(message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <div className="form-heading">
        <span className="icon-tile">
          <Icon name="vault" />
        </span>
        <div>
          <h2>Add a record</h2>
          <p className="muted">
            Start with one important detail. You can build from here.
          </p>
        </div>
      </div>
      <div className="form-pair">
        <label>
          Record title
          <input
            name="title"
            autoFocus
            required
            maxLength={160}
            placeholder="e.g. Home insurance"
          />
        </label>
        <label>
          Category
          <select name="category">
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="field-hint">
        Titles and categories are visible in your record list. Put private
        information in the fields below.
      </p>
      <label>
        Private details
        <textarea
          name="description"
          rows={3}
          placeholder="Where to find it, account details, or who to contact…"
        />
      </label>
      <label>
        Instructions for the future
        <textarea
          name="instructions"
          rows={3}
          placeholder="What would you want someone to know?"
        />
      </label>
      <label>
        Supporting file <span className="muted">· optional, up to 10 MB</span>
        <input name="attachment" type="file" />
      </label>
      <div className="form-section">
        <h3>
          <Icon name="lock" /> Protect this record
        </h3>
        <p className="muted">
          Choose a secret you can keep safely. You need this exact secret to
          unlock the record and its attachment. Account password resets cannot
          recover it.
        </p>
        <div className="form-pair">
          <label>
            Vault secret
            <input
              required
              name="secret"
              type="password"
              minLength={12}
              autoComplete="new-password"
              placeholder="At least 12 characters"
            />
          </label>
          <label>
            Confirm secret
            <input
              required
              name="confirm"
              type="password"
              minLength={12}
              autoComplete="new-password"
              placeholder="Enter it again"
            />
          </label>
        </div>
      </div>
      {notice && (
        <div role="alert" className="notice">
          {notice}
        </div>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          <Icon name="lock" />
          {busy ? "Encrypting and saving…" : "Save encrypted record"}
        </button>
      </div>
    </form>
  );
}
