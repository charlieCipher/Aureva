/* eslint-disable */
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import Upload from "./Upload";
import AssetForm from "./AssetForm";
import LegalExport from "./LegalExport";
import TrustBadges from "./TrustBadges";
import Pricing from "./Pricing";
import FamilySettings from "./FamilySetting";
import FamilyView from "./FamilyView";
import MahaWillNotice from "./MahaWillNotice";
import RecoveryPhrase from "./components/RecoveryPhrase";

const ADMIN_EMAILS = ["shounakzade@gmail.com"];

function isAdminEmail(email) {
  return ADMIN_EMAILS.includes((email || "").toLowerCase());
}

function App() {
  const [session, setSession] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showPricing, setShowPricing] = useState(false);
  const [userTier, setUserTier] = useState("free");
  const [showPhrase, setShowPhrase] = useState(false);

  function shouldShowRecoveryPhrase(currentSession) {
    if (!currentSession?.user) return false;
    return currentSession.user.user_metadata?.needs_recovery_phrase === true;
  }

  const isAdmin = isAdminEmail(session?.user?.email);
  const effectiveUserTier = isAdmin ? "admin" : userTier;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (shouldShowRecoveryPhrase(session)) {
        setShowPhrase(true);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "SIGNED_IN" && shouldShowRecoveryPhrase(session)) {
        setShowPhrase(true);
      }
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchAssets();
      fetchTier();
    }
  }, [session]);

  async function fetchAssets() {
    setLoadingAssets(true);
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
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

  async function handleLogout() {
    await supabase.auth.signOut();
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

  function handleAssetAdded(asset) {
    setAssets((prev) => [asset, ...prev]);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (!error) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSelectedAsset(null);
    }
  }

  async function handleEdit() {
    const { data, error } = await supabase
      .from("assets")
      .update({
        title: editData.title,
        type: editData.type,
        description: editData.description,
        instructions: editData.instructions,
      })
      .eq("id", editData.id)
      .select();

    if (!error) {
      setAssets((prev) =>
        prev.map((a) => (a.id === editData.id ? data[0] : a)),
      );
      setSelectedAsset(data[0]);
      setEditMode(false);
    }
  }

  const typeConfig = {
    Insurance: { color: "#6366f1", bg: "#1e1b4b", icon: "🛡️" },
    Bank: { color: "#10b981", bg: "#022c22", icon: "🏦" },
    Document: { color: "#f59e0b", bg: "#1c1107", icon: "📄" },
    Property: { color: "#3b82f6", bg: "#0c1a2e", icon: "🏠" },
    Investment: { color: "#8b5cf6", bg: "#1a0f2e", icon: "📈" },
    Other: { color: "#64748b", bg: "#0f172a", icon: "📁" },
  };

  const websiteTypeConfig = {
    Insurance: { color: "#74896d", bg: "#edf2e9" },
    Bank: { color: "#6f8a86", bg: "#eaf1ef" },
    Document: { color: "#9b8565", bg: "#f3eee5" },
    Property: { color: "#6d7f63", bg: "#e8eee4" },
    Investment: { color: "#7d7761", bg: "#f1eddf" },
    Other: { color: "#7b8074", bg: "#eeeeea" },
  };

  const totalAssets = assets.length;
  const assetsWithInstructions = assets.filter((a) => a.instructions).length;
  const assetsWithFiles = assets.filter((a) => a.file_path).length;

  function calculateScore() {
    let score = 0;
    if (totalAssets >= 1) score += 20;
    if (totalAssets >= 3) score += 15;
    if (totalAssets >= 6) score += 15;
    if (assetsWithInstructions >= 1) score += 20;
    if (assetsWithInstructions >= 3) score += 15;
    if (assetsWithFiles >= 1) score += 15;
    return Math.min(score, 100);
  }

  function getScoreMessage(score) {
    if (score === 0)
      return {
        text: "Your vault is empty. Your family won't know what you own.",
        color: "#ef4444",
      };
    if (score < 30)
      return {
        text: "Just getting started. Keep adding assets!",
        color: "#ef4444",
      };
    if (score < 50)
      return {
        text: "Good progress! Add instructions to help your family.",
        color: "#f59e0b",
      };
    if (score < 75)
      return {
        text: "Your vault is taking shape. Almost there!",
        color: "#f59e0b",
      };
    if (score < 100)
      return {
        text: "Great work! Your family will be well guided.",
        color: "#10b981",
      };
    return {
      text: "Perfect! Your family will be fully prepared. 🎉",
      color: "#10b981",
    };
  }

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || a.type === filterType;
    return matchesSearch && matchesType;
  });

  const tabStyle = (tab) => ({
    padding: "11px 18px",
    background: activeTab === tab ? "#171b14" : "rgba(255,255,250,0.58)",
    color: activeTab === tab ? "#fffefa" : "#5f6b59",
    border: activeTab === tab ? "1px solid #171b14" : "1px solid rgba(93,111,86,0.16)",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 999,
    boxShadow: activeTab === tab ? "0 12px 28px rgba(23,27,20,0.16)" : "none",
  });

  const inputStyle = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    padding: "12px",
    background: "#fffefa",
    border: "1px solid rgba(93,111,86,0.2)",
    borderRadius: 14,
    color: "#171b14",
    fontSize: 14,
    boxSizing: "border-box",
  };

  if (window.location.pathname === "/family") return <FamilyView />;
  if (showPricing)
    return (
      <Pricing
        onClose={() => setShowPricing(false)}
        userTier={effectiveUserTier}
      />
    );
  if (!session) return <Auth />;
  if (showPhrase) return <RecoveryPhrase onConfirmed={handleRecoveryConfirmed} />;

  if (selectedAsset) {
    const config = typeConfig[selectedAsset.type] || {
      color: "#64748b",
      bg: "#0f172a",
      icon: "📁",
    };
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
          <button
            onClick={() => {
              setSelectedAsset(null);
              setEditMode(false);
            }}
            style={{
              marginBottom: 20,
              padding: "8px 16px",
              background: "#1e293b",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            ← Back to Assets
          </button>

          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${config.color}33`,
            }}
          >
            <div
              style={{
                background: config.bg,
                padding: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 40 }}>{config.icon}</span>
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 20,
                    }}
                  >
                    {selectedAsset.title}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    Added{" "}
                    {new Date(selectedAsset.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  padding: "6px 14px",
                  background: config.color,
                  borderRadius: 20,
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {selectedAsset.type}
              </span>
            </div>

            <div style={{ padding: 24 }}>
              {!editMode ? (
                <>
                  {selectedAsset.description && (
                    <div style={{ marginBottom: 16 }}>
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          color: "#64748b",
                          fontSize: 12,
                          fontWeight: "bold",
                          letterSpacing: 1,
                        }}
                      >
                        DESCRIPTION
                      </p>
                      <p style={{ margin: 0, color: "#e2e8f0", fontSize: 15 }}>
                        {selectedAsset.description}
                      </p>
                    </div>
                  )}
                  {selectedAsset.instructions && (
                    <div
                      style={{
                        padding: "14px 16px",
                        background: "#0f172a",
                        borderRadius: 8,
                        borderLeft: `3px solid ${config.color}`,
                        marginBottom: 16,
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          color: config.color,
                          fontSize: 12,
                          fontWeight: "bold",
                          letterSpacing: 1,
                        }}
                      >
                        📋 FAMILY INSTRUCTIONS
                      </p>
                      <p style={{ margin: 0, color: "#cbd5e1", fontSize: 14 }}>
                        {selectedAsset.instructions}
                      </p>
                    </div>
                  )}
                  {selectedAsset.file_path && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "#0f172a",
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <p style={{ margin: 0, color: "#10b981", fontSize: 14 }}>
                        📎 Document attached to this asset
                      </p>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button
                      onClick={() => {
                        setEditMode(true);
                        setEditData({ ...selectedAsset });
                      }}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#6366f1",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedAsset.id)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                      marginBottom: 16,
                      letterSpacing: 1,
                    }}
                  >
                    EDIT ASSET
                  </p>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="Title"
                  />
                  <select
                    value={editData.type}
                    onChange={(e) =>
                      setEditData({ ...editData, type: e.target.value })
                    }
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="Insurance">Insurance</option>
                    <option value="Bank">Bank</option>
                    <option value="Document">Document</option>
                    <option value="Property">Property</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                  <textarea
                    value={editData.description || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Description"
                    rows={2}
                  />
                  <textarea
                    value={editData.instructions || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, instructions: e.target.value })
                    }
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      borderColor: "#6366f1",
                    }}
                    placeholder="Family instructions"
                    rows={4}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleEdit}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      ✅ Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        background: "#334155",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 8,
                        fontSize: 14,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const scoreMsg = getScoreMessage(score);
  const breakdownByType = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {});
  const readinessItems = [
    { done: totalAssets >= 1, text: "Add your first asset", points: 20 },
    { done: totalAssets >= 3, text: "Add 3 important records", points: 15 },
    { done: totalAssets >= 6, text: "Cover major family records", points: 15 },
    { done: assetsWithInstructions >= 1, text: "Write family instructions", points: 20 },
    { done: assetsWithInstructions >= 3, text: "Guide family on 3 records", points: 15 },
    { done: assetsWithFiles >= 1, text: "Attach one supporting file", points: 15 },
  ];
  const pageStyle = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 8%, rgba(255,255,250,0.95), transparent 32rem), linear-gradient(135deg, #e6ecdf 0%, #f8f7f1 50%, #dfe8dc 100%)",
    color: "#171b14",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: "24px",
  };
  const shellStyle = {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
  };
  const cardStyle = {
    background: "rgba(255,255,250,0.88)",
    border: "1px solid rgba(93,111,86,0.16)",
    borderRadius: 24,
    boxShadow: "0 24px 60px rgba(58,69,52,0.14)",
  };
  const primaryActionStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "#7f9278",
    color: "#fffefa",
    border: "1px solid rgba(93,111,86,0.18)",
    cursor: "pointer",
    borderRadius: 16,
    fontSize: 15,
    fontWeight: 800,
    textAlign: "left",
    boxShadow: "0 14px 32px rgba(95,115,89,0.2)",
  };

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <header
          style={{
            ...cardStyle,
            borderRadius: 28,
            padding: "16px 18px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            position: "sticky",
            top: 16,
            zIndex: 20,
            backdropFilter: "blur(18px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                background: "#171b14",
                color: "#fffefa",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 18,
              }}
            >
              A
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, color: "#171b14", letterSpacing: 0 }}>
                Aureva
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: "#6f766a" }}>
                Digital family legacy workspace
              </p>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button style={tabStyle("dashboard")} onClick={() => setActiveTab("dashboard")}>
              Home
            </button>
            <button style={tabStyle("assets")} onClick={() => setActiveTab("assets")}>
              Assets
            </button>
            <button style={tabStyle("vault")} onClick={() => setActiveTab("vault")}>
              Vault
            </button>
            <button style={tabStyle("family")} onClick={() => setActiveTab("family")}>
              Family
            </button>
          </nav>

          <div style={{ textAlign: "right", minWidth: 190 }}>
            <p style={{ margin: 0, color: "#6f766a", fontSize: 12 }}>{session.user.email}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
              {isAdmin ? (
                <span
                  style={{
                    padding: "6px 12px",
                    background: "#e8eee4",
                    color: "#5f7359",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Admin
                </span>
              ) : (
                <button
                  onClick={() => setShowPricing(true)}
                  style={{
                    padding: "6px 12px",
                    background: "#171b14",
                    color: "#fffefa",
                    border: "1px solid #171b14",
                    cursor: "pointer",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Upgrade
                </button>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 12px",
                  background: "transparent",
                  color: "#6f766a",
                  border: "1px solid rgba(93,111,86,0.18)",
                  cursor: "pointer",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  ...cardStyle,
                  padding: 36,
                  minHeight: 430,
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: 26,
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 14px 0",
                      color: "#7f9278",
                      fontSize: 13,
                      fontWeight: 900,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                    }}
                  >
                    Home
                  </p>
                  <h2
                    style={{
                      margin: "0 0 16px 0",
                      color: "#171b14",
                      fontSize: 56,
                      lineHeight: 1.02,
                      letterSpacing: 0,
                      fontWeight: 800,
                      maxWidth: 520,
                    }}
                  >
                    Keep your family prepared.
                  </h2>
                  <p
                    style={{
                      margin: "0 0 24px 0",
                      color: "#6f766a",
                      fontSize: 16,
                      lineHeight: 1.7,
                      maxWidth: 520,
                    }}
                  >
                    Aureva turns assets, files, instructions, and family access into one
                    calm legacy workspace.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 12,
                      maxWidth: 520,
                    }}
                  >
                    {[
                      { value: totalAssets, label: "Assets" },
                      { value: assetsWithInstructions, label: "Instructions" },
                      { value: assetsWithFiles, label: "Files" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: "#f4f2e9",
                          borderRadius: 18,
                          padding: "16px 14px",
                          border: "1px solid rgba(93,111,86,0.12)",
                        }}
                      >
                        <p style={{ margin: 0, color: "#171b14", fontSize: 28, fontWeight: 900 }}>
                          {item.value}
                        </p>
                        <p style={{ margin: "2px 0 0 0", color: "#6f766a", fontSize: 12 }}>
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    width: 230,
                    height: 230,
                    borderRadius: "50%",
                    background: "#f7f6f0",
                    position: "relative",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "inset 0 0 0 1px rgba(93,111,86,0.12)",
                  }}
                >
                  <svg width="230" height="230" viewBox="0 0 230 230">
                    <circle cx="115" cy="115" r="90" fill="none" stroke="#e4e2d8" strokeWidth="16" />
                    <circle
                      cx="115"
                      cy="115"
                      r="90"
                      fill="none"
                      stroke={score >= 75 ? "#7f9278" : score >= 40 ? "#b39a72" : "#b8554f"}
                      strokeWidth="16"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - score / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 115 115)"
                    />
                  </svg>
                  <div style={{ position: "absolute", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#171b14", fontSize: 52, fontWeight: 800 }}>
                      {score}%
                    </p>
                    <p style={{ margin: 0, color: "#6f766a", fontSize: 13, fontWeight: 800 }}>
                      Legacy Score
                    </p>
                  </div>
                </div>
              </div>

              <aside
                style={{
                  ...cardStyle,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
                    NEXT ACTIONS
                  </p>
                  <h2 style={{ margin: "0 0 14px 0", color: "#171b14", fontSize: 28, lineHeight: 1.12 }}>
                    Build your family view step by step.
                  </h2>
                  <p style={{ margin: "0 0 22px 0", color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
                    Focus on clarity first: add records, write instructions, then share access.
                  </p>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  <button style={primaryActionStyle} onClick={() => setActiveTab("assets")}>
                    Add Document
                  </button>
                  <button style={primaryActionStyle} onClick={() => setActiveTab("family")}>
                    Check Family View
                  </button>
                  <button
                    style={primaryActionStyle}
                    onClick={() =>
                      effectiveUserTier === "free" ? setShowPricing(true) : setActiveTab("dashboard")
                    }
                  >
                    Prepare Export
                  </button>
                </div>
              </aside>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div style={{ ...cardStyle, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
                      READINESS
                    </p>
                    <h2 style={{ margin: 0, color: "#171b14", fontSize: 28 }}>Family Preparedness</h2>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      padding: "8px 12px",
                      background: "#e8eee4",
                      borderRadius: 999,
                      color: "#5f7359",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {score < 50 ? "Needs attention" : score < 75 ? "Good progress" : "Well prepared"}
                  </p>
                </div>
                <p style={{ margin: "12px 0 20px 0", color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
                  {scoreMsg.text}
                </p>
                <div
                  style={{
                    background: "#ece9dc",
                    borderRadius: 999,
                    height: 10,
                    overflow: "hidden",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: `${score}%`,
                      height: "100%",
                      background: score >= 75 ? "#7f9278" : score >= 40 ? "#b39a72" : "#b8554f",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {readinessItems.map((item) => (
                    <div
                      key={item.text}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        background: item.done ? "#eef4ea" : "#f7f6f0",
                        border: "1px solid rgba(93,111,86,0.12)",
                        borderRadius: 16,
                      }}
                    >
                      <p style={{ margin: 0, color: item.done ? "#5f7359" : "#6f766a", fontSize: 14, fontWeight: 700 }}>
                        {item.text}
                      </p>
                      <span style={{ color: item.done ? "#5f7359" : "#9a9b92", fontSize: 12, fontWeight: 900 }}>
                        +{item.points}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <MahaWillNotice />
                <div style={{ ...cardStyle, padding: 24, boxShadow: "none" }}>
                  <p style={{ margin: "0 0 8px 0", color: "#7f9278", fontSize: 12, fontWeight: 900, letterSpacing: 1 }}>
                    VAULT MIX
                  </p>
                  <h2 style={{ margin: "0 0 14px 0", color: "#171b14", fontSize: 24 }}>Records by Type</h2>
                  {Object.keys(breakdownByType).length === 0 ? (
                    <p style={{ margin: 0, color: "#6f766a", fontSize: 14, lineHeight: 1.6 }}>
                      Add assets to see your family record map here.
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {Object.entries(breakdownByType).map(([type, count]) => (
                        <span
                          key={type}
                          style={{
                            padding: "8px 12px",
                            background: "#f4f2e9",
                            border: "1px solid rgba(93,111,86,0.13)",
                            borderRadius: 999,
                            fontSize: 12,
                            color: "#5f6b59",
                            fontWeight: 800,
                          }}
                        >
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section style={{ marginBottom: 24 }}>
              {effectiveUserTier !== "free" ? (
                <LegalExport assets={assets} userEmail={session.user.email} />
              ) : (
                <div style={{ ...cardStyle, padding: 32, textAlign: "center" }}>
                  <h2 style={{ margin: "0 0 8px 0", color: "#171b14", fontSize: 24 }}>
                    Legal Export PDF
                  </h2>
                  <p style={{ margin: "0 0 18px 0", color: "#6f766a", fontSize: 14 }}>
                    Generate a lawyer-ready PDF of all your assets and instructions.
                  </p>
                  <button
                    onClick={() => setShowPricing(true)}
                    style={{
                      padding: "12px 24px",
                      background: "#171b14",
                      color: "#fffefa",
                      border: "1px solid #171b14",
                      cursor: "pointer",
                      borderRadius: 999,
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    Unlock Legal Export - Rs. 1,299
                  </button>
                </div>
              )}
            </section>

            <TrustBadges />
          </>
        )}

        {activeTab === "assets" && (
          <>
            <AssetForm session={session} onAssetAdded={handleAssetAdded} />
            <section style={{ ...cardStyle, padding: 28, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, color: "#171b14", fontSize: 28 }}>Your Assets</h2>
                <button
                  onClick={fetchAssets}
                  style={{
                    padding: "8px 14px",
                    background: "#f4f2e9",
                    color: "#5f6b59",
                    border: "1px solid rgba(93,111,86,0.16)",
                    cursor: "pointer",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Refresh
                </button>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ ...inputStyle, flex: "1 1 260px", marginBottom: 0 }}
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ ...inputStyle, width: "auto", minWidth: 170, marginBottom: 0, cursor: "pointer" }}
                >
                  <option value="All">All Types</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Bank">Bank</option>
                  <option value="Document">Document</option>
                  <option value="Property">Property</option>
                  <option value="Investment">Investment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {loadingAssets && <p style={{ color: "#6f766a", fontSize: 14 }}>Loading assets...</p>}
              {!loadingAssets && filteredAssets.length === 0 && (
                <p style={{ color: "#6f766a", fontSize: 14 }}>
                  {search || filterType !== "All"
                    ? "No assets match your search."
                    : "No assets yet. Add your first one above."}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {filteredAssets.map((asset) => {
                  const config = websiteTypeConfig[asset.type] || {
                    color: "#7b8074",
                    bg: "#eeeeea",
                    icon: "File",
                  };
                  return (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      style={{
                        textAlign: "left",
                        background: "#fffefa",
                        borderRadius: 18,
                        border: "1px solid rgba(93,111,86,0.14)",
                        cursor: "pointer",
                        padding: 18,
                        boxShadow: "0 12px 28px rgba(58,69,52,0.08)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 14 }}>
                        <div>
                          <p style={{ margin: "0 0 6px 0", color: "#171b14", fontSize: 18, fontWeight: 850 }}>
                            {asset.title}
                          </p>
                          <p style={{ margin: 0, color: "#6f766a", fontSize: 12 }}>
                            Added {new Date(asset.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "6px 10px",
                            background: config.bg,
                            color: config.color,
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 850,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {asset.type}
                        </span>
                      </div>
                      {(asset.instructions || asset.file_path) && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                          {asset.instructions && (
                            <span style={{ color: "#5f7359", fontSize: 12, fontWeight: 800 }}>
                              Has instructions
                            </span>
                          )}
                          {asset.file_path && (
                            <span style={{ color: "#5f7359", fontSize: 12, fontWeight: 800 }}>
                              Has file
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === "vault" && (
          <section style={{ ...cardStyle, padding: 28, marginBottom: 24 }}>
            <Upload session={session} />
          </section>
        )}

        {activeTab === "family" &&
          (effectiveUserTier === "free" ? (
            <section style={{ ...cardStyle, padding: 36, textAlign: "center" }}>
              <h2 style={{ margin: "0 0 8px 0", color: "#171b14", fontSize: 28 }}>
                Family Access - Standard Plan
              </h2>
              <p style={{ margin: "0 0 22px 0", color: "#6f766a", fontSize: 14 }}>
                Upgrade to Standard to share a read-only family view.
              </p>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  padding: "12px 26px",
                  background: "#171b14",
                  color: "#fffefa",
                  border: "1px solid #171b14",
                  cursor: "pointer",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Unlock Family View - Rs. 1,299
              </button>
            </section>
          ) : (
            <FamilySettings session={session} />
          ))}
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #1e293b",
            paddingBottom: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24, color: "#6366f1" }}>
              🔐 Aureva
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              Your secure legacy vault
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              {session.user.email}
            </p>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 4,
                justifyContent: "flex-end",
              }}
            >
              {isAdmin ? (
                <span
                  style={{
                    padding: "4px 12px",
                    background: "#10b981",
                    color: "white",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  Admin
                </span>
              ) : (
                <button
                  onClick={() => setShowPricing(true)}
                  style={{
                    padding: "4px 12px",
                    background: "#f59e0b",
                    color: "black",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  ⭐ Upgrade
                </button>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 12px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <button
            style={tabStyle("dashboard")}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            style={tabStyle("assets")}
            onClick={() => setActiveTab("assets")}
          >
            📋 Assets
          </button>
          <button
            style={tabStyle("vault")}
            onClick={() => setActiveTab("vault")}
          >
            🔒 Vault
          </button>
          <button
            style={tabStyle("family")}
            onClick={() => setActiveTab("family")}
          >
            👨‍👩‍👧 Family
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            <MahaWillNotice />

            <div
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2
                style={{ margin: "0 0 16px 0", color: "white", fontSize: 18 }}
              >
                🧬 Life Completeness Score
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
                    flexShrink: 0,
                  }}
                >
                  <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r="38"
                      fill="none"
                      stroke={scoreMsg.color}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 45 45)"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 20,
                        fontWeight: "bold",
                        color: scoreMsg.color,
                      }}
                    >
                      {score}%
                    </p>
                  </div>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      color: scoreMsg.color,
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  >
                    {score < 50
                      ? "Needs Attention"
                      : score < 75
                        ? "Good Progress"
                        : "Well Prepared"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "#94a3b8",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {scoreMsg.text}
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 999,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${score}%`,
                    height: "100%",
                    background: scoreMsg.color,
                    borderRadius: 999,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  {
                    done: totalAssets >= 1,
                    text: "Added first asset",
                    points: 20,
                  },
                  {
                    done: totalAssets >= 3,
                    text: "Added 3 or more assets",
                    points: 15,
                  },
                  {
                    done: totalAssets >= 6,
                    text: "Added 6 or more assets",
                    points: 15,
                  },
                  {
                    done: assetsWithInstructions >= 1,
                    text: "Added family instructions",
                    points: 20,
                  },
                  {
                    done: assetsWithInstructions >= 3,
                    text: "Instructions on 3+ assets",
                    points: 15,
                  },
                  {
                    done: assetsWithFiles >= 1,
                    text: "Attached a document",
                    points: 15,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span>{item.done ? "✅" : "⬜"}</span>
                      <p
                        style={{
                          margin: 0,
                          color: item.done ? "#10b981" : "#64748b",
                          fontSize: 13,
                          textDecoration: item.done ? "line-through" : "none",
                        }}
                      >
                        {item.text}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: item.done ? "#10b981" : "#334155",
                        fontWeight: "bold",
                      }}
                    >
                      +{item.points}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <h2
                style={{ margin: "0 0 16px 0", color: "white", fontSize: 18 }}
              >
                📊 Vault Stats
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                {[
                  {
                    value: totalAssets,
                    label: "Total Assets",
                    color: "#6366f1",
                  },
                  {
                    value: assetsWithInstructions,
                    label: "With Instructions",
                    color: "#10b981",
                  },
                  {
                    value: assetsWithFiles,
                    label: "With Files",
                    color: "#f59e0b",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#0f172a",
                      borderRadius: 8,
                      padding: 16,
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 28,
                        fontWeight: "bold",
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              {totalAssets > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      color: "#64748b",
                      fontSize: 12,
                    }}
                  >
                    BREAKDOWN BY TYPE
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(
                      assets.reduce((acc, a) => {
                        acc[a.type] = (acc[a.type] || 0) + 1;
                        return acc;
                      }, {}),
                    ).map(([type, count]) => (
                      <span
                        key={type}
                        style={{
                          padding: "4px 12px",
                          background: typeConfig[type]?.color || "#64748b",
                          borderRadius: 20,
                          fontSize: 12,
                          color: "white",
                        }}
                      >
                        {typeConfig[type]?.icon} {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legal Export — locked for free users */}
            {effectiveUserTier !== "free" ? (
              <LegalExport assets={assets} userEmail={session.user.email} />
            ) : (
              <div
                style={{
                  background: "#1e293b",
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px 0",
                    color: "white",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  ⚖️ Legal Export PDF
                </p>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  Generate a lawyer-ready PDF of all your assets and
                  instructions.
                </p>
                <button
                  onClick={() => setShowPricing(true)}
                  style={{
                    padding: "10px 24px",
                    background: "#6366f1",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  Unlock Legal Export — ₹1,299
                </button>
              </div>
            )}

            <TrustBadges />
          </>
        )}

        {/* Assets Tab */}
        {activeTab === "assets" && (
          <>
            <AssetForm session={session} onAssetAdded={handleAssetAdded} />
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, color: "white", fontSize: 18 }}>
                  📋 Your Assets
                </h2>
                <button
                  onClick={fetchAssets}
                  style={{
                    padding: "6px 12px",
                    background: "#334155",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="🔍 Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "white",
                    fontSize: 14,
                  }}
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="Insurance">🛡️ Insurance</option>
                  <option value="Bank">🏦 Bank</option>
                  <option value="Document">📄 Document</option>
                  <option value="Property">🏠 Property</option>
                  <option value="Investment">📈 Investment</option>
                  <option value="Other">📁 Other</option>
                </select>
              </div>
              {loadingAssets && (
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Loading assets...
                </p>
              )}
              {!loadingAssets && filteredAssets.length === 0 && (
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  {search || filterType !== "All"
                    ? "No assets match your search."
                    : "No assets yet. Add your first one above!"}
                </p>
              )}
              {filteredAssets.map((a) => {
                const config = typeConfig[a.type] || {
                  color: "#64748b",
                  bg: "#0f172a",
                  icon: "📁",
                };
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAsset(a)}
                    style={{
                      background: "#1e293b",
                      borderRadius: 12,
                      marginBottom: 12,
                      overflow: "hidden",
                      border: `1px solid ${config.color}33`,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        background: config.bg,
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{config.icon}</span>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: "white",
                              fontWeight: "bold",
                              fontSize: 16,
                            }}
                          >
                            {a.title}
                          </p>
                          <p
                            style={{
                              margin: "2px 0 0 0",
                              color: "#94a3b8",
                              fontSize: 12,
                            }}
                          >
                            Added {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            padding: "4px 12px",
                            background: config.color,
                            borderRadius: 20,
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          {a.type}
                        </span>
                        <span style={{ color: "#64748b", fontSize: 18 }}>
                          ›
                        </span>
                      </div>
                    </div>
                    {(a.instructions || a.file_path) && (
                      <div
                        style={{
                          padding: "10px 20px",
                          display: "flex",
                          gap: 12,
                        }}
                      >
                        {a.instructions && (
                          <span style={{ fontSize: 12, color: "#818cf8" }}>
                            📋 Has instructions
                          </span>
                        )}
                        {a.file_path && (
                          <span style={{ fontSize: 12, color: "#10b981" }}>
                            📎 Has file
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Vault Tab */}
        {activeTab === "vault" && <Upload session={session} />}

        {/* Family Tab */}
        {activeTab === "family" &&
          (effectiveUserTier === "free" ? (
            <div
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 48, margin: "0 0 16px 0" }}>🔒</p>
              <h2 style={{ margin: "0 0 8px 0", color: "white", fontSize: 20 }}>
                Family Access — Standard Plan
              </h2>
              <p
                style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: 14 }}
              >
                Upgrade to Standard to share your vault with family.
              </p>
              <p
                style={{
                  margin: "0 0 8px 0",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                "Your family won't know what you own."
              </p>
              <button
                onClick={() => setShowPricing(true)}
                style={{
                  marginTop: 16,
                  padding: "12px 32px",
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                Unlock Family View — ₹1,299
              </button>
            </div>
          ) : (
            <FamilySettings session={session} />
          ))}
      </div>
    </div>
  );
}

export default App;
