function HealthDashboard({ health, jobs }) {
  return (
    <section className="card control-tower-card">
      <div className="section-heading">
        <div>
          <span className="soft-icon">C</span>
          <h2>Aureva Control Tower</h2>
        </div>
        <mark className="category-badge">Founder only</mark>
      </div>
      <div className="control-grid">
        <div>
          <strong>{health.value}/100</strong>
          <span>System health</span>
        </div>
        <div>
          <strong>{jobs.length}</strong>
          <span>Background jobs</span>
        </div>
        <div>
          <strong>0</strong>
          <span>Failed jobs</span>
        </div>
      </div>
    </section>
  );
}

export default HealthDashboard;

