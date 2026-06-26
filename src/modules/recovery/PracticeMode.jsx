function PracticeMode({ status, onPractice }) {
  return (
    <section className="card">
      <p className="eyebrow">Recovery Practice</p>
      <h2>Practice before an emergency.</h2>
      <p className="muted">
        Last practice: {status.daysSincePractice === null ? "Not practiced yet" : `${status.daysSincePractice} days ago`}
      </p>
      <button className="primary-button" onClick={onPractice}>Practice Recovery</button>
    </section>
  );
}

export default PracticeMode;

