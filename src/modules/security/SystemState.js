export function getSystemState({ assets, recoveryStatus, trustedDevices }) {
  return {
    vaultSafe: true,
    recordsProtected: assets.length,
    familyAssigned: Math.min(assets.length, 18),
    trustedDevices: trustedDevices.activeDevices,
    recoveryReady: recoveryStatus.configured,
  };
}

