export function formatIndianDate(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString("en-IN");
}

