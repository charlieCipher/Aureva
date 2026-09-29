import { useEffect, useRef, useState } from "react";
import { useVault } from "../../features/vault/VaultContext";
import { Button } from "../ui/Primitives";
import { safeFailure } from "../../modules/security/safeEvents";
export default function StatementForm({ section, onSaved }) {
  const v = useVault(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const pending = useRef(false), active = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  return (
    <form
      className="stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending.current) return;
        const element = e.currentTarget;
        const f = new FormData(element);
        const title = String(f.get('title') || '').trim();
        const statement = String(f.get('statement') || '');
        if (!title || title.length > 160) {
          setError('Enter a title between 1 and 160 characters.');
          element.elements.title.focus();
          return;
        }
        if (!statement.trim()) {
          setError('Write your intentions before saving this statement.');
          element.elements.statement.focus();
          return;
        }
        pending.current = true;
        setBusy(true);
        setError("");
        try {
          const saved = await v.service.create(
              {
                title,
                category: "Personal",
                kind: "statement",
                section,
                reviewed_at: new Date().toISOString(),
              },
              {
                description: statement,
                instructions: f.get("instructions"),
              },
              null,
            );
          if (active.current) {
            element.reset();
            onSaved(saved);
          }
        } catch (e) {
          if (active.current) setError(safeFailure(e));
        } finally {
          pending.current = false;
          for (const name of [...f.keys()]) f.delete(name);
          if (active.current) setBusy(false);
        }
      }}
    >
      <h2>{section}</h2>
      <label>
        Title
        <input name="title" required maxLength={160} />
      </label>
      <label>
        Your intentions
        <textarea name="statement" required rows={6} />
      </label>
      <label>
        Practical next steps
        <textarea name="instructions" rows={3} />
      </label>
      <p className="field-hint">
        Your title and message are encrypted before they leave this device.
      </p>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      <Button variant="primary" disabled={busy}>
        {busy ? "Encrypting…" : "Save encrypted statement"}
      </Button>
    </form>
  );
}
