export const backupVerificationJob = {
  name: "Backup Verification",
  interval: "Daily",
  checks: ["backup created", "backup restored", "backup verified"],
  status: "Ready",
};

