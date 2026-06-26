export function getRecoveryReadiness(userMetadata = {}) {
  return {
    configured: userMetadata.needs_recovery_phrase !== true,
    practicedAt: userMetadata.recovery_practiced_at || null,
    confirmedAt: userMetadata.recovery_phrase_confirmed_at || null,
  };
}

export function getDaysSinceRecoveryPractice(practicedAt) {
  if (!practicedAt) return null;
  const elapsed = Date.now() - new Date(practicedAt).getTime();
  return Math.max(0, Math.floor(elapsed / 86400000));
}

