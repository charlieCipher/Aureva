import { useState } from "react";
import { familyService } from "../modules/family/FamilyService";
import { errorMessage } from "../shared/utils/errors";
export default function FamilyForm({ session, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const element = event.currentTarget;
    const values = new FormData(element);
    if (!values.get("name").trim()) return setNotice("Enter a name.");
    setBusy(true);
    setNotice("");
    try {
      const { data, error } = await familyService.addMember({
        user_id: session.user.id,
        display_name: values.get("name").trim(),
        relationship: values.get("relationship").trim(),
      });
      if (error) throw error;
      element.reset();
      onSaved(data);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack-form panel" onSubmit={submit}>
      <h2>Add someone important</h2>
      <label>
        Name
        <input name="name" required maxLength={120} placeholder="Full name" />
      </label>
      <label>
        Relationship
        <input
          name="relationship"
          maxLength={100}
          placeholder="e.g. Sister, partner, executor"
        />
      </label>
      <p className="field-hint">
        This saves a contact in your vault. It does not send an invitation or
        grant access to your records.
      </p>
      {notice && (
        <div role="alert" className="notice">
          {notice}
        </div>
      )}
      <button className="primary" disabled={busy}>
        {busy ? "Saving…" : "Save family member"}
      </button>
    </form>
  );
}
