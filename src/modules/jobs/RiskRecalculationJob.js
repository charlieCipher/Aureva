export const riskRecalculationJob = {
  name: "Risk Recalculation",
  interval: "Every 30 min",
  checks: ["system_state", "recent events", "trusted devices"],
  status: "Scheduled",
};

