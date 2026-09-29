import { encryptAsset, decryptAsset } from "../../modules/security/crypto";

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function readFile(file) {
  if (file.size > MAX_FILE_SIZE)
    return Promise.reject(new Error("Choose a file smaller than 10 MB."));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("This file could not be read. Please select it again."));
    reader.onabort = () => reject(new Error("File reading was cancelled."));
    reader.readAsDataURL(file);
  });
}

export async function encryptedFile(file, secret) {
  const data = await readFile(file);
  const envelope = await encryptAsset(
    { name: file.name, type: file.type, data },
    secret,
  );
  return new Blob([JSON.stringify(envelope)], { type: "application/json" });
}

export async function decryptFile(
  contents,
  secret,
  fallbackName = "attachment",
) {
  if (contents.trimStart().startsWith("{"))
    return decryptAsset(JSON.parse(contents), secret);
  // Older Aureva attachments used CryptoJS's OpenSSL-compatible passphrase format.
  // Read compatibility only: all new files are written with authenticated AES-GCM.
  if (!contents.startsWith("U2FsdGVkX1"))
    throw new Error("This attachment format is not supported.");
  const { default: CryptoJS } = await import("crypto-js");
  const data = CryptoJS.AES.decrypt(contents, secret).toString(
    CryptoJS.enc.Utf8,
  );
  if (!/^data:[^,]*;base64,/.test(data))
    throw new Error("That secret could not open this attachment.");
  return { data, name: fallbackName };
}

export function downloadFile(payload) {
  if (
    typeof payload?.data !== "string" ||
    !/^data:[^,]*;base64,/.test(payload.data)
  )
    throw new Error("This attachment has an invalid format.");
  const raw = atob(payload.data.slice(payload.data.indexOf(",") + 1));
  const blob = new Blob(
    [Uint8Array.from(raw, (character) => character.charCodeAt(0))],
    { type: "application/octet-stream" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.name || "attachment";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
