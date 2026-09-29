export function errorMessage(error) {
  const message = error?.message || String(error || "Something went wrong.");
  if (/failed to fetch|network|fetch failed|timed out/i.test(message))
    return "We couldn’t connect to your vault. Check your connection and try again. If this continues, the vault’s backend may be unavailable.";
  if (/schema cache|does not exist|PGRST205/i.test(message))
    return "Your vault database needs an update. Please contact the account administrator.";
  if (/invalid login credentials/i.test(message))
    return "The email or password is incorrect. Please try again.";
  return message;
}
