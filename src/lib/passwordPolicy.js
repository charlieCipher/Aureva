export const MIN_PASSWORD_LENGTH = 16;
export const PASSWORD_HINT = 'Use at least 16 characters.';

// Apply when choosing a new password, not when checking an existing one.
export function validateNewPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(PASSWORD_HINT);
  }
}
