export function calculateSessionRisk({ activeDevices = 0, recentEvents = 0 }) {
  if (activeDevices > 4 || recentEvents > 12) return "Needs Attention";
  return "Safe";
}

