import { getTrustedDeviceSummary } from "./DeviceTrust";
import { calculateSessionRisk } from "./RiskScoring";

export const sessionService = {
  getTrustedDeviceState() {
    const summary = getTrustedDeviceSummary();
    return {
      ...summary,
      risk: calculateSessionRisk({ activeDevices: summary.activeDevices, recentEvents: 3 }),
    };
  },
};

