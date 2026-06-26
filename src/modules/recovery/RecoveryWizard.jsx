function RecoveryWizard({ status, onOpen }) {
  return (
    <section className="card">
      <p className="eyebrow">Recovery Wizard</p>
      <h2>{status.label}</h2>
      <p className="muted">
        Verify that your Family Recovery Key is saved and understandable before your family needs it.
      </p>
      <button className="ghost-button" onClick={onOpen}>Open Recovery Wizard</button>
    </section>
  );
}

export default RecoveryWizard;

