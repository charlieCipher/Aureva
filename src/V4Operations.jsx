import { useState } from "react";
import { familyService } from "./modules/family/FamilyService";
import { legacyService } from "./modules/legacy/LegacyService";
import { encryptAsset, generateIntegrityHash } from "./modules/security/crypto";

export default function V4Operations({ session, familyMembers, legacyStatements, shieldRequests, onChanged, onPracticeRecovery }) {
  const [memberName, setMemberName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [statementTitle, setStatementTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [vaultSecret, setVaultSecret] = useState("");
  const [notice, setNotice] = useState("");

  async function addMember(event) {
    event.preventDefault();
    const { error } = await familyService.addMember({ user_id: session.user.id, display_name: memberName, relationship });
    setNotice(error ? error.message : "Family member added.");
    if (!error) { setMemberName(""); setRelationship(""); onChanged(); }
  }

  async function addStatement(event) {
    event.preventDefault();
    if (vaultSecret.length < 12) return setNotice("Use a vault secret of at least 12 characters for the legacy statement.");
    const encrypted_payload = await encryptAsset({ statement }, vaultSecret);
    const integrity_hash = await generateIntegrityHash(encrypted_payload);
    const { error } = await legacyService.createStatement({ user_id: session.user.id, title: statementTitle, encrypted_payload, integrity_hash });
    setNotice(error ? error.message : "Encrypted legacy statement created.");
    if (!error) { setStatementTitle(""); setStatement(""); setVaultSecret(""); onChanged(); }
  }

  async function requestShield() {
    const { error } = await legacyService.createShieldRequest({ user_id: session.user.id, action: "SHARE_ACCESS", target_label: "Property Documents", approver_label: "Trusted Contact" });
    setNotice(error ? error.message : "Shield approval request created.");
    if (!error) onChanged();
  }

  return (
    <section id="more" className="v4-card v4-operations">
      <CardTitle label="MORE — V4 CONTROLS" title="Family, Legacy & Shield" />
      <div className="v4-operation-grid">
        <form onSubmit={addMember}>
          <h3>Family members</h3>
          <p>{familyMembers.length} protected member{familyMembers.length === 1 ? "" : "s"}</p>
          <input required value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="Name" />
          <input value={relationship} onChange={(event) => setRelationship(event.target.value)} placeholder="Relationship or professional role" />
          <button className="v4-primary">Add member</button>
        </form>
        <form onSubmit={addStatement}>
          <h3>Legacy statement</h3>
          <p>{legacyStatements.length} encrypted statement{legacyStatements.length === 1 ? "" : "s"}</p>
          <input required value={statementTitle} onChange={(event) => setStatementTitle(event.target.value)} placeholder="Statement title" />
          <textarea required value={statement} onChange={(event) => setStatement(event.target.value)} placeholder="Write your private message" rows="3" />
          <input required type="password" value={vaultSecret} onChange={(event) => setVaultSecret(event.target.value)} placeholder="Vault secret" />
          <button className="v4-primary">Encrypt statement</button>
        </form>
        <div>
          <h3>Shield approval</h3>
          <p>{shieldRequests.filter((request) => request.status === "PENDING").length} pending request{shieldRequests.filter((request) => request.status === "PENDING").length === 1 ? "" : "s"}</p>
          <p className="v4-muted">High-risk sharing requires a trusted contact’s approval.</p>
          <button className="v4-primary" onClick={requestShield}>Request approval</button>
        </div>
        <div>
          <h3>Recovery practice</h3>
          <p>Practice the recovery process without accessing production vault data.</p>
          <button className="v4-secondary" onClick={onPracticeRecovery}>Record recovery practice</button>
        </div>
      </div>
      {notice && <p className="v4-operation-notice">{notice}</p>}
    </section>
  );
}

function CardTitle({ label, title }) {
  return <div className="v4-card-title"><p>{label}</p><h2>{title}</h2></div>;
}
