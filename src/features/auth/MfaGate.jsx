import { useEffect, useState } from "react";
import { AuthProvider } from "../../lib/providers";
import { Button, Card } from "../../components/ui/Primitives";
import SecureEntryFrame from '../../components/security/SecureEntryFrame';
import { safeFailure } from "../../modules/security/safeEvents";
export default function MfaGate({ children }) {
  const [status, setStatus] = useState("loading"),
    [factor, setFactor] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        const data = await AuthProvider.assurance();
        if (!["aal1","aal2"].includes(data?.currentLevel) || !["aal1","aal2"].includes(data?.nextLevel)) throw new Error("Invalid assurance state.");
        if (data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
          const factors = await AuthProvider.factors();
          const totp = factors.totp.find((f) => f.status === "verified");
          if (!totp) throw new Error("Verification method unavailable.");
          if (alive) {
            setFactor(totp.id);
            setStatus("challenge");
          }
        } else if (alive) setStatus("ready");
      } catch (e) {
        if (alive) {
          setError(safeFailure(e));
          setStatus("error");
        }
      }
    }
    check();
    return () => {
      alive = false;
    };
  }, [retry]);
  if (status === "ready") return children;
  return (
    <SecureEntryFrame>
      <Card>
        <h1>
          {status === "loading"
            ? "Checking account protection…"
            : "Verify your sign in"}
        </h1>
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        {status === "challenge" && (
          <form
            className="stack-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              const element = e.currentTarget;
              try {
                await AuthProvider.verifyMfa(factor, new FormData(element).get("code"));
                const assurance = await AuthProvider.assurance();
                if (assurance.currentLevel !== "aal2") throw new Error("Verification did not establish MFA.");
                element.reset();
                setStatus("ready");
              } catch (e) {
                setError(safeFailure(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Authenticator code
              <input
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                required
                maxLength={6}
              />
            </label>
            <Button variant="primary" disabled={busy}>
              {busy ? "Verifying…" : "Verify"}
            </Button>
          </form>
        )}
        {status === "error" && (
          <Button
            onClick={() => {
              setError("");
              setStatus("loading");
              setRetry((n) => n + 1);
            }}
          >
            Retry
          </Button>
        )}
        <Button onClick={() => AuthProvider.signOut().catch(e => setError(safeFailure(e)))}>Sign out</Button>
      </Card>
    </SecureEntryFrame>
  );
}
