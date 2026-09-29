import {sanitizeEvent} from '../security/safeEvents';
const allowedEvents = new Set(['asset_created','asset_updated','asset_deleted','recovery_verified','recovery_practiced','device_trusted','security_state_changed','export_requested']);
class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
  }

  on(eventName, listener) {
    const listeners = this.listeners.get(eventName) || [];
    this.listeners.set(eventName, [...listeners, listener]);

    return () => {
      const nextListeners = (this.listeners.get(eventName) || []).filter((item) => item !== listener);
      this.listeners.set(eventName, nextListeners);
    };
  }

  emit(eventName, payload = {}) {
    if (!allowedEvents.has(eventName)) return null;
    const safe = sanitizeEvent({record_id:payload.assetId,device_id:payload.deviceId,severity:payload.severity});
    const event = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${eventName}`,
      name: eventName,
      payload: safe,
      createdAt: new Date().toISOString(),
    };

    this.history = [event, ...this.history].slice(0, 100);
    (this.listeners.get(eventName) || []).forEach((listener) => listener(event));
    return event;
  }

  getHistory() {
    return this.history;
  }
}

export const eventBus = new EventBus();
