export const cleanupJob = {
  name: "Session Cleanup",
  interval: "Every hour",
  checks: ["expired sessions", "stale tokens", "inactive trusted devices"],
  status: "Scheduled",
};

