import { Brand } from '../ui/Primitives';

// Keep account verification, vault setup and unlock in the authentication identity.
export default function SecureEntryFrame({ children }) {
  return <main className="auth-page secure-entry-page">
    <section className="auth-story">
      <a href="/" className="brand" aria-label="LEQVOR home"><Brand/></a>
      <div className="auth-story-copy">
        <h1>A More Secure<br/>Tomorrow</h1>
        <p>Protect what you’ve built.<br/>Preserve what matters.<br/>Give tomorrow more possibilities.</p>
        <span className="secure-entry-tagline">Assets | Records | Forever</span>
      </div>
      <div className="auth-footer"><blockquote>“The greatest wealth<br/>is a future they can call their own.”</blockquote><span>LEQVOR</span><i/></div>
    </section>
    <section className="auth-entry"><div className="vault-gate secure-entry-form">{children}</div></section>
  </main>;
}
