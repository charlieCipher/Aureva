export const notificationNames = ['Security alerts', 'Access requests', 'Important activity', 'Product updates'];
export const sampleDevices = ['MacBook Pro', 'iPhone 15 Pro', 'iPad Air'];
export const sampleSessions = [...sampleDevices, 'Chrome · Windows'];

export function detailPreferences(name, preferences = {}) {
  if (name === 'Notification Preferences' || notificationNames.includes(name)) {
    return { 'Security alerts': true, 'Access requests': true, 'Important activity': true,
      'Product updates': false, ...preferences['Notification Preferences'] };
  }
  return preferences[name];
}

export function saveDetailPreferences(previous, name, value) {
  const key = notificationNames.includes(name) ? 'Notification Preferences' : name;
  return { ...previous, [key]: { ...previous[key], ...value } };
}

export function policySummary(name, preferences) {
  const value = preferences[name] || {};
  if (name === 'Cold Lock') return `${value.timeout || '5'} min`;
  if (name === 'PIN scrambling') return value['Randomize the PIN keypad'] ? 'On' : 'Off';
  if (name === 'Duress Protection') return value['Prepare an ordinary alternate vault'] ? 'Preview configured' : 'Off';
  const count = ['Full vault export', 'Critical record sharing', 'Recovery configuration changes', 'Emergency access'].filter(key => value[key]).length;
  return count ? `${count} actions` : 'Not configured';
}
