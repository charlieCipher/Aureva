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
    const event = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${eventName}`,
      name: eventName,
      payload,
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

