import { eventBus } from "../EventBus";

const auditEvents = [];

export function registerAuditListener(eventName) {
  return eventBus.on(eventName, (event) => {
    auditEvents.unshift({
      ...event,
      label: event.name.replaceAll("_", " "),
    });
  });
}

export function getAuditEvents() {
  return auditEvents.slice(0, 50);
}

