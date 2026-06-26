function AlertCenter({ jobs }) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="soft-icon">J</span>
          <h2>Job & Alert Center</h2>
        </div>
      </div>
      <div className="job-list">
        {jobs.map((job) => (
          <div className="job-row" key={job.name}>
            <div>
              <strong>{job.name}</strong>
              <p>{job.interval}</p>
            </div>
            <mark>{job.status}</mark>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AlertCenter;

