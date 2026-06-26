export function calculateEventRisk(eventName) {
  if (eventName.includes("deleted")) return "needs_review";
  if (eventName.includes("device")) return "monitor";
  return "normal";
}

