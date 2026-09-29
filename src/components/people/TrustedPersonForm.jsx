import { useEffect, useRef, useState } from "react";
import { useVault } from "../../features/vault/VaultContext";
import { Button } from "../ui/Primitives";
import { safeFailure } from "../../modules/security/safeEvents";
export default function TrustedPersonForm({ onSaved }) {
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
        const form = new FormData(element);
        const name = String(form.get('name') || '').trim();
        const relationship = String(form.get('relationship') || '').trim();
        for (const [field, value, label] of [['name', name, 'name'], ['relationship', relationship, 'relationship or professional role']]) {
          if (!value || value.length > 120) {
            setError(`Enter a ${label} between 1 and 120 characters.`);
            element.elements[field].focus();
            return;
          }
        }
        pending.current = true;
        setBusy(true);
        setError("");
        try {
          const saved = await v.service.addPerson({
              display_name: name,
              relationship,
              professional: form.get("professional") === "on",
              reviewed_at: new Date().toISOString(),
            });
          if (active.current) {
            element.reset();
            onSaved(saved);
          }
        } catch (e) {
          if (active.current) setError(safeFailure(e));
        } finally {
          pending.current = false;
          for (const name of [...form.keys()]) form.delete(name);
          if (active.current) setBusy(false);
        }
      }}
    >
      <h2>Add to your trusted circle</h2>
      <label>
        Name
        <input name="name" required maxLength={120} />
      </label>
      <label>
        Relationship or professional role
        <input name="relationship" required maxLength={120} />
      </label>
      <label className="checkbox-label">
        <input type="checkbox" name="professional" />
        Professional contact
      </label>
      <p className="muted">
        Names and relationships are encrypted. Adding a person does not send an
        invitation or grant access.
      </p>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      <Button variant="primary" disabled={busy}>
        {busy ? "Encrypting…" : "Save trusted person"}
      </Button>
    </form>
  );
}
