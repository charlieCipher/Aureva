export function calculateSecurityHealth({ assets, recoveryStatus, trustedDevices, assetsWithFiles, assetsWithInstructions }) {
  const breakdown = [
    { label: "Recovery Key Verified", points: recoveryStatus.configured ? 25 : 0, max: 25 },
    { label: "Passkey Enabled", points: 20, max: 20 },
    { label: "Trusted Device", points: trustedDevices.activeDevices > 0 ? 15 : 0, max: 15 },
    { label: "Backup Verified", points: assetsWithFiles > 0 || assets.length > 0 ? 20 : 0, max: 20 },
    { label: "Recovery Practice", points: assetsWithInstructions > 0 ? 10 : 0, max: 10 },
  ];

  const value = breakdown.reduce((total, item) => total + item.points, 0);
  return {
    value,
    max: 90,
    status: value >= 75 ? "Good" : value >= 55 ? "Needs Attention" : "Critical",
    breakdown,
  };
}
