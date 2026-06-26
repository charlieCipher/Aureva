function ShieldMonitor({ shield }) {
  return (
    <section className="card">
      <p className="eyebrow">Shield Monitor</p>
      <h2>{shield.label}</h2>
      <div className="status-list">
        {shield.notes.map((note) => (
          <p key={note}><span />{note}</p>
        ))}
      </div>
    </section>
  );
}

export default ShieldMonitor;

