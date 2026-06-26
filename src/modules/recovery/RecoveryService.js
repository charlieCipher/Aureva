import { eventBus } from "../events/EventBus";
import { EVENT_TYPES } from "../events/event-types";
import { getDaysSinceRecoveryPractice, getRecoveryReadiness } from "./RecoveryEngine";

export const recoveryService = {
  getStatus(session) {
    const readiness = getRecoveryReadiness(session?.user?.user_metadata || {});
    return {
      ...readiness,
      daysSincePractice: getDaysSinceRecoveryPractice(readiness.practicedAt),
      label: readiness.configured ? "Recovery Ready" : "Recovery Setup Needed",
    };
  },

  practice() {
    return eventBus.emit(EVENT_TYPES.RECOVERY_PRACTICED, { source: "security_center" });
  },
};

