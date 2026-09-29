// @vitest-environment node
import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  encryptAsset,
  decryptAsset,
  generateIntegrityHash,
  verifyIntegrity,
} from "../src/modules/security/crypto.js";

describe("encrypted record compatibility", () => {
  it("unlocks after the database changes envelope property order", async () => {
    const payload = {
      description: "Private test detail",
      instructions: "Keep this safe",
    };
    const envelope = await encryptAsset(
      payload,
      "a test secret of sufficient length",
    );
    const hash = await generateIntegrityHash(envelope);
    const reordered = Object.fromEntries(Object.entries(envelope).reverse());
    expect(await verifyIntegrity(reordered, hash)).toBe(true);
    expect(
      await decryptAsset(reordered, "a test secret of sufficient length"),
    ).toEqual(payload);
  });
  it("reads the original V4 insertion-order hashes", async () => {
    const envelope = {
      cipher_text: "cipher",
      iv: "iv",
      salt: "salt",
      algorithm: "AES-256-GCM",
      kdf: "Argon2id:t=3,m=65536,p=1",
    };
    const originalHash = createHash("sha256")
      .update(JSON.stringify(envelope))
      .digest("base64");
    expect(
      await verifyIntegrity(
        Object.fromEntries(Object.entries(envelope).reverse()),
        originalHash,
      ),
    ).toBe(true);
    expect(
      await verifyIntegrity(
        { ...envelope, cipher_text: "changed" },
        originalHash,
      ),
    ).toBe(false);
  });
  it("rejects wrong secrets and ciphertext modified even with a recomputed hash", async () => {
    const envelope = await encryptAsset(
      { statement: "A private letter" },
      "the original vault secret",
    );
    await expect(
      decryptAsset(envelope, "a different vault secret"),
    ).rejects.toThrow();
    const altered = {
      ...envelope,
      cipher_text:
        (envelope.cipher_text[0] === "A" ? "B" : "A") +
        envelope.cipher_text.slice(1),
    };
    await expect(
      decryptAsset(altered, "the original vault secret"),
    ).rejects.toThrow();
  });
  it("uses unique salts and nonces for repeated content", async () => {
    const first = await encryptAsset(
      { text: "same" },
      "a reusable test secret",
    );
    const second = await encryptAsset(
      { text: "same" },
      "a reusable test secret",
    );
    expect(first.salt).not.toBe(second.salt);
    expect(first.iv).not.toBe(second.iv);
    expect(first.cipher_text).not.toBe(second.cipher_text);
    expect(await verifyIntegrity(null, "hash")).toBe(false);
  });
});
