import { Component, Suspense } from 'react';

class ScreenError extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="loading-page">
      <div role="alert">
        <h1>This screen could not open</h1>
        <p>Reload LEQVOR to try again. You may need to unlock your vault again.</p>
        <button className="primary" onClick={() => window.location.reload()}>Reload LEQVOR</button>
      </div>
    </main>;
    return this.props.children;
  }
}

export default function ScreenBoundary({ children }) {
  return <ScreenError><Suspense fallback={<main className="loading-page" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <p>Opening LEQVOR…</p>
  </main>}>{children}</Suspense></ScreenError>;
}
