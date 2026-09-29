import { argon2idAsync } from "@noble/hashes/argon2.js";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ARGON2ID_OPTIONS = { t: 3, m: 64 * 1024, p: 1, dkLen: 32 };

function toBase64(bytes) {
  let binary = "";
  new Uint8Array(bytes).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function deriveKey(secret, salt) {
  if (!secret || secret.length < 12)
    throw new Error("Use a vault secret of at least 12 characters.");
  const derivedBytes = await argon2idAsync(
    encoder.encode(secret),
    salt,
    ARGON2ID_OPTIONS,
  );
  try { return await crypto.subtle.importKey(
    "raw",
    derivedBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  ); } finally { derivedBytes.fill(0); }
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

async function hashString(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toBase64(digest);
}

export async function generateIntegrityHash(value) {
  return hashString(
    typeof value === "string" ? value : JSON.stringify(canonicalize(value)),
  );
}

export async function encryptAsset(payload, secret) {
  const salt = generateSalt();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret, salt);
  const plaintext = encoder.encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );
  return {
    cipher_text: toBase64(ciphertext),
    iv: toBase64(iv),
    salt: toBase64(salt),
    algorithm: "AES-256-GCM",
    kdf: "Argon2id:t=3,m=65536,p=1",
  };
}

export async function decryptAsset(envelope, secret) {
  const key = await deriveKey(secret, fromBase64(envelope.salt));
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(envelope.iv) },
    key,
    fromBase64(envelope.cipher_text),
  );
  try { return JSON.parse(decoder.decode(plaintext)); }
  finally { new Uint8Array(plaintext).fill(0); }
}

export async function verifyIntegrity(payload, expectedHash) {
  if (!payload || !expectedHash) return false;
  if ((await generateIntegrityHash(payload)) === expectedHash) return true;
  // V4 originally hashed this exact insertion order before jsonb reordered it.
  // Retain reads of those envelopes; new writes use canonical JSON.
  const legacyKeys = ["cipher_text", "iv", "salt", "algorithm", "kdf"];
  if (
    Object.keys(payload).length !== legacyKeys.length ||
    !legacyKeys.every((key) => typeof payload[key] === "string")
  )
    return false;
  return (
    (await hashString(
      JSON.stringify(
        Object.fromEntries(legacyKeys.map((key) => [key, payload[key]])),
      ),
    )) === expectedHash
  );
}

export const SECURITY_CORE_FROZEN = [
  "Client-side encryption",
  "AES-256-GCM",
  "Argon2id key derivation",
  "SHA-256 integrity checks",
  "Supabase RLS",
];
