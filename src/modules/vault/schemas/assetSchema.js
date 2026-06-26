export const VAULT_CATEGORIES = [
  "Personal",
  "Bank",
  "Investment",
  "Legal",
  "Property",
  "Insurance",
  "Loan",
  "Other",
];

export const ASSET_VERSIONING_SCHEMA = {
  table: "asset_versions",
  columns: ["id", "asset_id", "version", "encrypted_data", "created_at"],
  purpose: "Keeps continuity record history and protects against accidental overwrite.",
};

