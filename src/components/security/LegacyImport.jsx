import { useEffect, useState } from "react";
import { assetService } from "../../modules/vault/AssetService";
import { decryptAsset, verifyIntegrity } from "../../modules/security/crypto";
import { decryptFile } from "../../shared/utils/files";
import { supabase } from "../../supabase";
import { useVault } from "../../features/vault/VaultContext";
import { safeFailure } from "../../modules/security/safeEvents";
import { completeness } from "../../modules/continuity/readiness";
import { Button } from "../ui/Primitives";
export default function LegacyImport() {
  const v = useVault(),
    [records, setRecords] = useState([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState([]);
  useEffect(() => {
    let alive = true;
    assetService
      .listAssets()
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(safeFailure(error));
        else setRecords(data || []);
      })
      .catch((e) => {
        if (alive) setError(safeFailure(e));
      });
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="stack-form">
      <h2>Import earlier records</h2>
      <p className="muted">
        Create a V5 encrypted copy using each record’s original secret.
        Originals stay unchanged; their old plaintext titles remain until you
        separately remove those originals.
      </p>
      {records.map((record) => (
        <form
          className="stack-form form-section"
          key={record.id}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const element = e.currentTarget,
              secret = new FormData(element).get("secret");
            try {
              if (
                !record.encrypted_payload ||
                !(await verifyIntegrity(
                  record.encrypted_payload,
                  record.integrity_hash,
                ))
              )
                throw new Error("Legacy record integrity is unavailable.");
              const payload = await decryptAsset(
                record.encrypted_payload,
                secret,
              );
              let file = null;
              if (record.file_path) {
                const { data, error } = await supabase.storage
                  .from("vault")
                  .download(record.file_path);
                if (error) throw error;
                const doc = await decryptFile(await data.text(), secret);
                const raw = atob(doc.data.split(",")[1]);
                const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
                file = new File([bytes], doc.name || "attachment", {
                  type: doc.type || "application/octet-stream",
                });
                bytes.fill(0);
              }
              await v.service.create(
                {
                  title: record.title,
                  category:
                    record.category === "Medical" ? "Other" : record.category,
                  reviewed_at: new Date().toISOString(),
                  completeness: completeness(payload),
                },
                payload,
                file,
              );
              element.reset();
              setDone((old) => [...old, record.id]);
            } catch (e) {
              setError(safeFailure(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>{record.title}</h3>
          {done.includes(record.id) ? (
            <p role="status">Encrypted copy created.</p>
          ) : (
            <>
              <label>
                Original vault secret
                <input
                  type="password"
                  name="secret"
                  required
                  minLength={12}
                  autoComplete="off"
                />
              </label>
              <Button disabled={busy}>Create encrypted V5 copy</Button>
            </>
          )}
        </form>
      ))}
      {!records.length && !error && <p>No earlier records found.</p>}
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
