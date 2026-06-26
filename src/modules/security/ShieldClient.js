export function getShieldStatus() {
  return {
    status: "Safe",
    label: "Shield active",
    notes: ["Integrity checks ready", "No custom crypto added", "RLS remains the data boundary"],
  };
}

