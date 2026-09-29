import { useState } from "react";
import { legacyService } from "../modules/legacy/LegacyService";
import {
  encryptAsset,
  generateIntegrityHash,
} from "../modules/security/crypto";
import { errorMessage } from "../shared/utils/errors";
import Icon from "./Icon";
export default function LegacyForm({ session, onSaved, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    if (!form.get("title").trim() || !form.get("statement").trim())
      return setNotice("Add a title and a message for your letter.");
    if (form.get("secret") !== form.get("confirm"))
      return setNotice("The vault secrets don’t match.");
    setBusy(true);
    setNotice("");
    try {
      const encrypted_payload = await encryptAsset(
        { statement: form.get("statement") },
        form.get("secret"),
      );
      const integrity_hash = await generateIntegrityHash(encrypted_payload);
      const result = await legacyService.createStatement({
        user_id: session.user.id,
        title: form.get("title").trim(),
        encrypted_payload,
        integrity_hash,
      });
      if (result.error) throw result.error;
      onSaved(result.data);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack-form" onSubmit={submit}>
      <div className="form-heading">
        <span className="icon-tile">
          <Icon name="heart" />
        </span>
        <div>
          <h2>Leave a few words</h2>
          <p className="muted">
            A memory, a wish, or something you want them to know.
          </p>
        </div>
      </div>
      <label>
        Letter title
        <input
          name="title"
          autoFocus
          required
          maxLength={160}
          placeholder="e.g. For my children"
        />
      </label>
      <p className="field-hint">
        The title appears in your list. Your message stays encrypted.
      </p>
      <label>
        Your message
        <textarea
          name="statement"
          required
          rows={8}
          placeholder="There’s something I’d like you to know…"
        />
      </label>
      <div className="form-pair">
        <label>
          Vault secret
          <input
            name="secret"
            required
            type="password"
            minLength={12}
            autoComplete="new-password"
            placeholder="At least 12 characters"
          />
        </label>
        <label>
          Confirm secret
          <input
            name="confirm"
            required
            type="password"
            minLength={12}
            autoComplete="new-password"
          />
        </label>
      </div>
      <p className="field-hint">
        Keep this secret safely. Aureva cannot recover it or automatically
        deliver this letter.
      </p>
      {notice && (
        <div role="alert" className="notice">
          {notice}
        </div>
      )}
      <div className="form-actions">
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button className="primary" disabled={busy}>
          {busy ? "Encrypting and saving…" : "Save private letter"}
        </button>
      </div>
    </form>
  );
}
