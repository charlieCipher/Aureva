export function mapEventForAnalytics(event) {
  return {
    name: event.name,
    createdAt: event.createdAt,
    hasPayload: Boolean(event.payload && Object.keys(event.payload).length),
  };
}

