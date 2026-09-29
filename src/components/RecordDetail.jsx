import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { decryptAsset, verifyIntegrity } from "../modules/security/crypto";
import { downloadFile, decryptFile } from "../shared/utils/files";
import Icon from "./Icon";

export default function RecordDetail({ record, legacy = false, onLock }) {
  const [secret, setSecret] = useState("");
  const [payload, setPayload] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    if (!payload) return;
    const timeout = window.setTimeout(() => { setPayload(null); setSecret(''); onLock?.(); }, 30000);
    return () => window.clearTimeout(timeout);
  }, [payload, onLock]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function unlock(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      if (!record.encrypted_payload)
        throw new Error(
          "This older record has not been encrypted with the current vault format. Keep the original and create an encrypted copy.",
        );
      if (
        !(await verifyIntegrity(
          record.encrypted_payload,
          record.integrity_hash,
        ))
      )
        throw new Error(
          "This record could not be verified. Keep the original and contact support.",
        );
      const result = await decryptAsset(record.encrypted_payload, secret);
      if (mounted.current) setPayload(result);
    } catch (error) {
      if (mounted.current)
        setNotice(
          error.name === "OperationError"
            ? "That secret could not unlock this record. Check it and try again."
            : error.message,
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function download() {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await supabase.storage
        .from("vault")
        .download(record.file_path);
      if (error) throw error;
      const result = await decryptFile(
        await data.text(),
        secret,
        record.file_path
          .split("/")
          .pop()
          .replace(/\.enc$/, ""),
      );
      if (mounted.current) downloadFile(result);
    } catch {
      if (mounted.current)
        setNotice(
          "The attachment could not be opened. Check your connection and try again.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section className="panel detail-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">
            {legacy
              ? "PERSONAL LETTER"
              : record.category || record.type || "RECORD"}
          </p>
          <h2>{record.title}</h2>
        </div>
        <span className="icon-tile">
          <Icon name={legacy ? "heart" : "file"} />
        </span>
      </div>
      {!payload ? (
        <div className="locked-content">
          <span className="lock-medallion">
            <Icon name="lock" size={30} />
          </span>
          {record.encrypted_payload ? (
            <>
              <h3>Only your secret opens this.</h3>
              <p className="muted">
                Enter the vault secret you used when saving{" "}
                {legacy ? "this letter" : "this record"}.
              </p>
              <form className="stack-form" onSubmit={unlock}>
                <label>
                  Vault secret
                  <input
                    required
                    type="password"
                    minLength={12}
                    value={secret}
                    autoComplete="off"
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter your vault secret"
                  />
                </label>
                <button disabled={busy} className="primary">
                  <Icon name="lock" />
                  {busy ? "Unlocking…" : "Unlock privately"}
                </button>
              </form>
              <p className="field-hint">Decryption happens on this device.</p>
            </>
          ) : (
            <>
              <h3>Saved in an earlier version</h3>
              <p className="muted">
                This record’s details were stored without the current
                encryption. You can still view them. Save a new encrypted copy
                to protect these details.
              </p>
              <button
                className="secondary"
                onClick={() =>
                  setPayload({
                    description: record.description,
                    instructions: record.instructions,
                  })
                }
              >
                Show older record
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="record-content">
          <div className="status-tag">
            <Icon name="check" size={16} />{" "}
            {record.encrypted_payload
              ? "Unlocked on this device"
              : "Older record · unencrypted details"}
          </div>
          {legacy ? (
            <p className="letter-content">{payload.statement}</p>
          ) : (
            <>
              <h3>Private details</h3>
              <p>{payload.description || "No details added."}</p>
              <h3>Instructions</h3>
              <p>{payload.instructions || "No instructions added."}</p>
              {record.file_path && record.encrypted_payload && (
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={download}
                >
                  <Icon name="download" />
                  {busy
                    ? "Opening attachment…"
                    : payload.file_name || "Download attachment"}
                </button>
              )}
              {record.file_path && !record.encrypted_payload && (
                <form
                  className="stack-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    download();
                  }}
                >
                  <label>
                    Original attachment secret
                    <input
                      required
                      type="password"
                      autoComplete="off"
                      value={secret}
                      onChange={(event) => setSecret(event.target.value)}
                    />
                  </label>
                  <button className="secondary" disabled={busy}>
                    <Icon name="download" />
                    {busy ? "Opening attachment…" : "Download older attachment"}
                  </button>
                  <p className="field-hint">
                    Older attachments use the original encryption format.
                  </p>
                </form>
              )}
            </>
          )}
          <button className="secondary" onClick={onLock}>
            <Icon name="lock" />
            Lock content
          </button>
        </div>
      )}
      {notice && (
        <div role="alert" className="notice">
          {notice}
        </div>
      )}
      <div className="detail-footer">
        <Icon name="shield" size={16} />
        <span>Unlocked content hides when you leave this window.</span>
      </div>
    </section>
  );
}
