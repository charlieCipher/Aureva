/* eslint-disable */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import AssetForm from "./AssetForm";
import Pricing from "./Pricing";
import FamilyView from "./FamilyView";
import RecoveryPhrase from "./components/RecoveryPhrase";
import { assetService } from "./modules/vault/AssetService";

const ADMIN_EMAILS = ["shounakzade@gmail.com"];

const vaultCategories = [
  { name: "Personal", count: 8, color: "blue" },
  { name: "Financial", count: 12, color: "red" },
  { name: "Legal", count: 15, color: "amber" },
  { name: "Medical", count: 6, color: "red" },
  { name: "Property", count: 7, color: "green" },
  { name: "Other", count: 4, color: "blue" },
];

const healthBreakdown = [
  ["Recovery Key Verified", "25 / 25"],
  ["Passkey Enabled", "20 / 20"],
  ["Trusted Device", "15 / 15"],
  ["Backup Verified", "20 / 20"],
  ["Recovery Practice", "10 / 10"],
];

const securityEvents = [
  ["Login from trusted device", "Today, 8:35 AM", "info"],
  ["Passkey used", "Today, 9:32 AM", "info"],
  ["Unusual location detected", "Yesterday, 8:22 PM", "warning"],
  ["Emergency Lockdown activated", "Yesterday, 8:15 PM", "critical"],
];

const navItems = [
  { id: "home", label: "Home", icon: "H" },
  { id: "vault", label: "Vault", icon: "V" },
  { id: "family", label: "Family", icon: "F" },
  { id: "legacy", label: "Legacy", icon: "L" },
  { id: "security", label: "Security", icon: "S" },
  { id: "more", label: "More", icon: "M" },
];

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}

function App() {
  const [session, setSession] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [revealedRecordId, setRevealedRecordId] = useState(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showPhrase, setShowPhrase] = useState(false);
  const [search, setSearch] = useState("");
  const [userTier, setUserTier] = useState("free");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.needs_recovery_phrase === true) setShowPhrase(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "SIGNED_IN" && session?.user?.user_metadata?.needs_recovery_phrase === true) {
        setShowPhrase(true);
      }
    });

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAssets();
      fetchTier();
    }
  }, [session]);

  async function fetchAssets() {
    setLoadingAssets(true);
    const { data, error } = await assetService.listAssets();
    if (!error) setAssets(data || []);
    setLoadingAssets(false);
  }

  async function fetchTier() {
    if (isAdminEmail(session?.user?.email)) {
      setUserTier("admin");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", session?.user?.id)
      .single();

    if (data) setUserTier(data.tier || "free");
  }

  async function handleRecoveryConfirmed() {
    const { error } = await supabase.auth.updateUser({
      data: {
        needs_recovery_phrase: false,
        recovery_phrase_confirmed_at: new Date().toISOString(),
      },
    });
    if (error) {
      alert("Could not save this step. Please try again.");
      return;
    }
    setShowPhrase(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function lockSensitiveSession() {
    setRevealedRecordId(null);
  }

  function navigateTo(id) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAssetAdded(asset) {
    setAssets((prev) => [asset, ...prev]);
    setShowAssetForm(false);
    setSelectedAsset(asset);
  }

  const displayName =
    session?.user?.user_metadata?.name ||
    session?.user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "Shounak";

  const firstName = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Shounak";

  const normalizedRecords = useMemo(() => {
    return assets.map((asset) => ({
      id: asset.id,
      title: asset.title || "Untitled Record",
      type: asset.type || "Personal",
      description: asset.description || "Encrypted continuity record",
      instructions: asset.instructions || "No continuity instructions added yet.",
      created_at: asset.created_at,
    }));
  }, [assets]);

  const filteredRecords = normalizedRecords.filter((record) => {
    return record.title.toLowerCase().includes(search.toLowerCase());
  });

  const fallbackRecord = {
    id: "demo-passport",
    title: "Passport",
    type: "Personal",
    description: "This content is encrypted. Tap reveal to view.",
    instructions: "Sensitive record details stay hidden until you reveal them.",
  };

  const currentRecord = selectedAsset || normalizedRecords[0] || fallbackRecord;
  const isRevealed = revealedRecordId === currentRecord.id;
  const protectedRecords = Math.max(normalizedRecords.length, 156);
  const effectiveUserTier = isAdminEmail(session?.user?.email) ? "admin" : userTier;

  if (window.location.pathname === "/family") return <FamilyView />;
  if (showPricing) return <Pricing onClose={() => setShowPricing(false)} userTier={effectiveUserTier} />;
  if (!session) return <Auth />;
  if (showPhrase) return <RecoveryPhrase onConfirmed={handleRecoveryConfirmed} />;

  return (
    <div className="v4-shell">
      <aside className="v4-sidebar">
        <div>
          <div className="v4-logo-mark">A</div>
          <div className="v4-brand">AUREVA</div>
          <p className="v4-brand-copy">Protect today<br />Secure tomorrow<br />Pass on with love</p>
          <nav className="v4-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                onClick={() => navigateTo(item.id)}
              >
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <button className="v4-lock-button" onClick={lockSensitiveSession}>Lock Session</button>
        </div>

        <div className="v4-sidebar-stack">
          <MiniPanel title="SESSION STATUS">
            <div className="session-good">Secure Session</div>
            <strong>09:42 remaining</strong>
            <p>Sensitive content hides when you leave this app.</p>
            <button onClick={() => navigateTo("security")}>Learn more</button>
          </MiniPanel>
          <MiniPanel title="AUTO-LOCK TRIGGERS">
            {["App in background", "Device locked", "Tab hidden", "App switcher protected"].map((item) => (
              <p className="check-line" key={item}>{item}</p>
            ))}
          </MiniPanel>
          <MiniPanel title="REVEAL STATE">
            <div className="reveal-state-grid">
              <div><span className="lock-art">L</span><p>Encrypted<br />Tap to reveal</p></div>
              <div><span className="eye-art">E</span><p>Revealed<br />Sensitive content</p></div>
            </div>
          </MiniPanel>
        </div>
      </aside>

      <main className="v4-main">
        <section id="home" className="v4-board v4-home-board">
          <div className="v4-section-title">
            <span>HOME DASHBOARD (Level 1)</span>
            <div><button>N</button><button>S</button></div>
          </div>
          <div className="v4-home-grid">
            <div className="v4-welcome">
              <p>Good morning,</p>
              <h1>{firstName}.</h1>
              <span>Your continuity. Your legacy. Protected.</span>
            </div>
            <SecurityHealthCard />
            <div className="v4-stat-stack">
              <StatCard icon="F" label="Family Members" value="4" link="View Family" onClick={() => navigateTo("family")} />
              <StatCard icon="P" label="Pending Approvals" value="2" sub="Requires your action" />
              <StatCard icon="A" label="Security Alerts" value="1" link="View Timeline" onClick={() => navigateTo("security")} danger />
            </div>
          </div>
        </section>

        <div className="v4-content-grid">
          <section id="vault" className="v4-card v4-vault-card">
            <CardTitle label="VAULT - RECORDS (Level 1)" title="Vault" />
            <div className="v4-search-row">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." />
              <button>F</button>
              <button className="v4-primary" onClick={() => setShowAssetForm((value) => !value)}>+ Add Record</button>
            </div>
            {showAssetForm && (
              <div className="v4-form-wrap">
                <AssetForm session={session} categoryOptions={["Personal", "Financial", "Legal", "Medical", "Property", "Other"]} onAssetAdded={handleAssetAdded} />
              </div>
            )}
            <div className="v4-record-list">
              {(filteredRecords.length ? filteredRecords : vaultCategories).map((item) => {
                const isRecord = Boolean(item.title);
                const title = isRecord ? item.title : item.name;
                const count = isRecord ? item.type : `${item.count} records`;
                return (
                  <button
                    key={isRecord ? item.id : item.name}
                    onClick={() => isRecord && setSelectedAsset(item)}
                    className="v4-list-row"
                  >
                    <span className={`category-icon ${item.color || "blue"}`}>{title.charAt(0)}</span>
                    <div><strong>{title}</strong><p>{count}</p></div>
                    <b>›</b>
                  </button>
                );
              })}
              {loadingAssets && <p className="v4-muted">Loading records...</p>}
            </div>
          </section>

          <RecordDetailCard record={currentRecord} revealed={false} onReveal={() => setRevealedRecordId(currentRecord.id)} />
          <RecordDetailCard record={currentRecord} revealed={isRevealed} onReveal={() => setRevealedRecordId(currentRecord.id)} onHide={lockSensitiveSession} />

          <section id="family" className="v4-card">
            <CardTitle label="FAMILY OVERVIEW (Level 1)" title="Family Overview" />
            <div className="v4-two-stats">
              <InfoNumber value="4" label="Family Members" sub="People you've added" />
              <InfoNumber value="22" label="Assignments" sub="Across 4 family members" />
            </div>
            <button className="v4-primary wide" onClick={() => navigateTo("family-dashboard")}>View Family Dashboard</button>
          </section>

          <section id="family-dashboard" className="v4-card">
            <CardTitle label="FAMILY DASHBOARD (Level 1)" title="Overview" />
            <div className="v4-tabs"><span className="active">Overview</span><span>Members</span><span>Assignments</span></div>
            <div className="v4-family-list">
              {["Spouse - 12 assignments", "Son - 5 assignments", "Daughter - 3 assignments", "Brother - 2 assignments"].map((item) => (
                <button key={item}>{item}<span>›</span></button>
              ))}
            </div>
            <button className="v4-link">View All Members →</button>
          </section>

          <ShieldRequester />
          <ShieldApprover />

          <section id="legacy" className="v4-card">
            <CardTitle label="LEGACY - TIMELINE (Level 1)" title="Intent Timeline" />
            <div className="timeline-list">
              {["Will Document updated", "Property Record modified", "Record reassigned", "Legacy Statement added"].map((item, index) => (
                <div className="timeline-item" key={item}><span className={`dot-${index}`} /><p>{item}<small>12 May 2024 · 10:{24 + index} AM</small></p></div>
              ))}
            </div>
            <button className="v4-link">View Full Timeline →</button>
          </section>

          <LegacyStatement revealed={false} />
          <LegacyStatement revealed />

          <section id="security" className="v4-card">
            <CardTitle label="SECURITY TIMELINE" title="Security Timeline" />
            <div className="security-event-list">
              {securityEvents.map(([title, meta, type]) => (
                <div className={`security-event ${type}`} key={title}><span /> <div><strong>{title}</strong><p>{meta}</p></div></div>
              ))}
            </div>
            <button className="v4-link">View Full Timeline →</button>
          </section>

          <RiskScreens />
          <LockScreens />
        </div>

        <section id="more" className="v4-footer-features">
          {[
            ["Zero-Knowledge", "We never see your decrypted data."],
            ["End-to-End Encryption", "All records encrypted before they leave your device."],
            ["Recovery First", "Your recovery key ensures you're never locked out."],
            ["Trusted Sessions", "Auto-locks when app backgrounded, device locks, or tab hidden."],
            ["Shield Protection", "High-risk actions require trusted approvals."],
            ["Evidence of Intent", "Timelines and versions preserve intent for the future."],
          ].map(([title, text]) => (
            <div key={title}><span>S</span><strong>{title}</strong><p>{text}</p></div>
          ))}
          <p className="v4-zero-note">Aureva uses zero-knowledge encryption. Your data is encrypted on your device and never accessible to our servers.</p>
          <button className="v4-signout" onClick={handleLogout}>Sign Out</button>
          <button className="v4-profile" onClick={() => setShowPricing(true)}>Profile / Plan</button>
        </section>
      </main>
    </div>
  );
}

function MiniPanel({ title, children }) {
  return <section className="v4-mini-panel"><h3>{title}</h3>{children}</section>;
}

function CardTitle({ label, title }) {
  return <div className="v4-card-title"><p>{label}</p><h2>{title}</h2></div>;
}

function SecurityHealthCard() {
  return (
    <section className="v4-health-card">
      <div className="v4-gauge"><strong>90</strong><span>/ 90</span></div>
      <h2>Security Health</h2>
      <button>View details →</button>
      <div className="health-breakdown">
        {healthBreakdown.map(([label, points]) => (
          <p key={label}><span />{label}<b>{points}</b></p>
        ))}
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, sub, link, onClick, danger }) {
  return (
    <button className={`v4-stat-card ${danger ? "danger" : ""}`} onClick={onClick}>
      <span>{icon}</span><div><p>{label}</p><strong>{value}</strong>{sub && <small>{sub}</small>}{link && <em>{link} →</em>}</div>
    </button>
  );
}

function InfoNumber({ value, label, sub }) {
  return <div className="v4-info-number"><strong>{value}</strong><p>{label}</p><span>{sub}</span></div>;
}

function RecordDetailCard({ record, revealed, onReveal, onHide }) {
  return (
    <section className="v4-card v4-record-detail">
      <div className="v4-detail-head"><button>←</button><h2>{record.title}</h2><button>⋮</button></div>
      {!revealed ? (
        <div className="encrypted-state">
          <span className="lock-orb">L</span>
          <h3>Encrypted Record</h3>
          <p>This content is encrypted.<br />Tap reveal to view.</p>
          <button className="v4-primary" onClick={onReveal}>Reveal</button>
          <small>Auto-locks in 10:00</small>
        </div>
      ) : (
        <div className="revealed-state">
          <div className="secure-banner">Secure Session <b>09:42 remaining</b></div>
          <dl>
            <div><dt>Record Type</dt><dd>{record.type}</dd></div>
            <div><dt>Description</dt><dd>{record.description}</dd></div>
            <div><dt>Instructions</dt><dd>{record.instructions}</dd></div>
            <div><dt>Owner</dt><dd>Account owner</dd></div>
          </dl>
          <button className="v4-secondary" onClick={onHide}>Hide Again</button>
        </div>
      )}
    </section>
  );
}

function ShieldRequester() {
  return (
    <section className="v4-card">
      <CardTitle label="SHIELD - REQUESTER VIEW" title="Share Access" />
      <div className="approval-state">Awaiting Shield Approval</div>
      <p>You requested permission to share <strong>Property Documents</strong> with <strong>Spouse</strong>.</p>
      {["Request Sent", "Awaiting Approval", "Approval Received", "Access Granted"].map((item, index) => (
        <div className="approval-row" key={item}><span>{index + 1}</span><p>{item}</p><b>{index < 2 ? "In progress" : "Pending"}</b></div>
      ))}
    </section>
  );
}

function ShieldApprover() {
  return (
    <section className="v4-card">
      <CardTitle label="SHIELD - APPROVER VIEW" title="Approval Request" />
      <div className="approver-block"><span>S</span><p>Shounak requests to share <strong>Property Documents</strong> with <strong>Spouse</strong>.</p></div>
      <p className="v4-muted">For updating property nomination and legal records.</p>
      <button className="approve-button">Approve</button>
      <button className="deny-button">Deny</button>
    </section>
  );
}

function LegacyStatement({ revealed }) {
  return (
    <section className="v4-card v4-record-detail">
      <div className="v4-detail-head"><button>←</button><h2>Letter to My Children</h2><button>⋮</button></div>
      {!revealed ? (
        <div className="encrypted-state"><span className="lock-orb">L</span><h3>Encrypted Statement</h3><p>This statement is encrypted.<br />Tap reveal to read.</p><button className="v4-primary">Reveal</button></div>
      ) : (
        <div className="revealed-state"><div className="secure-banner">Secure Session <b>09:31 remaining</b></div><p>My dear children,<br />Life will take you on your own journeys. I hope this letter reminds you that no matter where life takes you, my love and values will always stay with you.<br /><br />With all my love,<br />Mom</p><button className="v4-secondary">Hide Again</button></div>
      )}
    </section>
  );
}

function RiskScreens() {
  return (
    <section className="v4-risk-grid">
      {[
        ["Verification Required", "We just want to confirm it's you.", "Verify Identity"],
        ["Account Protected", "We detected unusual activity and restricted sensitive actions.", "Review Activity"],
        ["Emergency Lockdown", "Your vault has been secured.", "Begin Recovery"],
      ].map(([title, text, action], index) => (
        <div className={`v4-risk-card risk-${index}`} key={title}><span>{index === 2 ? "!" : "S"}</span><h3>{title}</h3><p>{text}</p><button>{action}</button></div>
      ))}
    </section>
  );
}

function LockScreens() {
  return (
    <section className="v4-lock-grid">
      <div><h3>LOCK SCREEN</h3><span className="lock-orb">L</span><h4>Session Locked</h4><p>Your return to Aureva has been locked for your security.</p><button>Unlock</button></div>
      <div><h3>APP SWITCHER PROTECTION</h3><span className="app-badge">A</span><h4>Aureva</h4><p>Sensitive content hidden in your preview.</p></div>
    </section>
  );
}

export default App;
