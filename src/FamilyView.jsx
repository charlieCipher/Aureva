function FamilyView() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#070b22", color: "#eff3ff", fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <section style={{ width: "100%", maxWidth: 560, padding: 36, borderRadius: 24, border: "1px solid rgba(167,139,250,.35)", background: "linear-gradient(145deg, rgba(37,27,80,.88), rgba(8,14,42,.92))", boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}>
        <img src="/aureva-logo.png" alt="Aureva" style={{ width: 250, maxWidth: "100%", borderRadius: 10, marginBottom: 24 }} />
        <p style={{ color: "#c4b5fd", fontWeight: 800, fontSize: 12, letterSpacing: ".12em" }}>SHIELD-PROTECTED FAMILY ACCESS</p>
        <h1 style={{ margin: "8px 0 14px", fontSize: 32 }}>Access is approval-based.</h1>
        <p style={{ margin: 0, lineHeight: 1.65, color: "#cbd5e1" }}>Aureva V4 no longer accepts a shared continuity code. A trusted person receives access only after the owner’s Shield-approved invitation and their own authenticated session are verified.</p>
        <button onClick={() => { window.location.href = "/"; }} style={{ marginTop: 24, padding: "12px 18px", border: 0, borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #5b31d5)", color: "white", fontWeight: 800, cursor: "pointer" }}>Return to Aureva</button>
      </section>
    </main>
  );
}

export default FamilyView;
