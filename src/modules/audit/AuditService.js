import { mapAssetToTimeline, mapSecurityEvent } from "./TimelineMapper";

export const auditService = {
  buildTimeline({ assets, recoveryStatus, trustedDevices }) {
    const assetEvents = assets.slice(0, 5).map(mapAssetToTimeline);
    const systemEvents = [
      mapSecurityEvent("Vault unlocked", trustedDevices.trustedDeviceLabel),
      mapSecurityEvent(recoveryStatus.label, "Family Recovery Key status checked"),
      mapSecurityEvent("Backup verification scheduled", "Created, restored, and verified model ready", "monitor"),
    ];

    return [...assetEvents, ...systemEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

