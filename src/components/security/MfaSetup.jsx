import { useState } from "react";
import { AuthProvider } from "../../lib/providers";
import { Button } from "../ui/Primitives";
import { safeFailure } from "../../modules/security/safeEvents";
export default function MfaSetup() {
  const [factor, setFactor] = useState(null),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const list = await AuthProvider.factors();
      if (!Array.isArray(list?.totp)) throw new Error('Authenticator status unavailable.');
      if (list.totp.some((f) => f.status === "verified")) {
        setDone(true);
        return;
      }
      const data = await AuthProvider.enrollMfa();
      if (!data?.id || !data?.totp?.qr_code) throw new Error('Authenticator enrollment unavailable.');
      setFactor(data);
    } catch (e) {
      setError(safeFailure(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack-form">
      <h2>Multi-factor authentication</h2>
      {done ? (
        <p role="status">Authenticator protection is enabled.</p>
      ) : factor ? (
        <form
          className="stack-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setError('');
            try {
              const code = new FormData(e.currentTarget).get('code');
              if (!/^[0-9]{6}$/.test(code || '')) throw new Error('Enter a six-digit authenticator code.');
              await AuthProvider.verifyMfa(factor.id, code);
              const [assurance, factors] = await Promise.all([AuthProvider.assurance(), AuthProvider.factors()]);
              if (assurance?.currentLevel !== 'aal2' || !factors?.totp?.some(f => f.id === factor.id && f.status === 'verified'))
                throw new Error('Authenticator verification is incomplete. Try again.');
              setFactor(null);
              setDone(true);
            } catch (e) {
              setError(safeFailure(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>Scan this code with your authenticator app.</p>
          <img
            className="mfa-qr"
            src={factor.totp.qr_code}
            alt="Authenticator enrollment QR code"
          />
          <label>
            Authenticator code
            <input
              name="code"
              pattern="[0-9]{6}"
              inputMode="numeric"
              required
              autoComplete="one-time-code"
            />
          </label>
          <Button variant="primary" disabled={busy}>
            Verify & enable
          </Button>
        </form>
      ) : (
        <Button disabled={busy} onClick={start}>
          {busy ? "Preparing…" : "Set up authenticator"}
        </Button>
      )}
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
    </div>
  );
}
