import { useEffect, useRef, useState } from "react";
import { AuthProvider } from "../../lib/providers";
import { safeFailure } from "../../modules/security/safeEvents";
import { Button } from "../ui/Primitives";
export default function SecureAction({ title, onVerified }) {
  const active = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="stack-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending.current) return;
        pending.current = true;
        setBusy(true);
        setError("");
        const element = e.currentTarget;
        const form = new FormData(element);
        try {
          await AuthProvider.reauthenticate(form.get('password'),form.get('code'));
          if (!active.current) return;
          element.reset();
          await onVerified();
        } catch (e) {
          if (active.current) setError(safeFailure(e));
        } finally {
          element.reset();
          for (const name of [...form.keys()]) form.delete(name);
          pending.current = false;
          if (active.current) setBusy(false);
        }
      }}
    >
      <h2>{title}</h2>
      <p className="muted">
        Confirm your account password for this sensitive action.
      </p>
      <label>
        Account password
        <input
          type="password"
          name="password"
          required
          disabled={busy}
          autoComplete="current-password"
        />
      </label>
      <label>Authenticator code, if enabled<input name="code" disabled={busy} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}/></label>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <Button variant="primary" disabled={busy}>
        {busy ? "Verifying…" : "Verify & continue"}
      </Button>
    </form>
  );
}
