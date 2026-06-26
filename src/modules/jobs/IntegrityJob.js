export const integrityJob = {
  name: "Integrity Verification",
  interval: "Every 24h",
  checks: ["verifyIntegrity()", "random protected records", "file checksum readiness"],
  status: "Scheduled",
};

