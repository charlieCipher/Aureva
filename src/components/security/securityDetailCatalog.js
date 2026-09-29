export const settings = {
  'Shield approvals': ['Require approval for', ['Full vault export', 'Critical record sharing', 'Recovery configuration changes', 'Emergency access']],
  'Notification Preferences': ['Notify me about', ['Security alerts', 'Access requests', 'Important activity', 'Product updates']],
  'PIN scrambling': ['Keypad preference', ['Randomize the PIN keypad']],
  'Duress Protection': ['Optional alternate environment', ['Prepare an ordinary alternate vault']],
};
export const securityDetailNames = new Set([
  ...Object.keys(settings), 'Cold Lock', 'Recovery phrase', 'Recovery practice',
  'Trusted devices', 'Active sessions', 'Passkeys', 'Face ID / Touch ID',
  'Require biometric confirmation', 'Multi-factor authentication', 'Security Timeline',
  'Account deletion', 'Security alerts', 'Access requests', 'Important activity', 'Product updates',
]);

