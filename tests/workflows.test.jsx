import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import AssetForm from "../src/AssetForm";
import RecordDetail from "../src/components/RecordDetail";
import Workspace from "../src/app/Workspace";
import { assetService } from "../src/modules/vault/AssetService";
import { familyService } from "../src/modules/family/FamilyService";
import { legacyService } from "../src/modules/legacy/LegacyService";
import { decryptAsset, encryptAsset } from "../src/modules/security/crypto";

vi.mock("../src/supabase", () => ({
  supabase: { auth: { signOut: vi.fn() } },
  supabaseConfig: { configured: true },
}));
vi.mock("../src/modules/vault/AssetService", () => ({
  assetService: {
    createAsset: vi.fn(),
    listAssets: vi.fn(),
    uploadEncryptedFile: vi.fn(),
  },
}));
vi.mock("../src/modules/vault/AssetRepository", () => ({
  assetRepository: { removeFile: vi.fn() },
}));
vi.mock("../src/modules/family/FamilyService", () => ({
  familyService: { listMembers: vi.fn() },
}));
vi.mock("../src/modules/legacy/LegacyService", () => ({
  legacyService: { listStatements: vi.fn() },
}));
vi.mock("../src/modules/security/crypto", () => ({
  decryptAsset: vi.fn(),
  encryptAsset: vi.fn(),
  generateIntegrityHash: vi.fn().mockResolvedValue("hash"),
  verifyIntegrity: vi.fn().mockResolvedValue(true),
}));
const session = {
  user: {
    id: "test-user",
    email: "test@example.invalid",
    user_metadata: { name: "Test" },
  },
};
const record = {
  id: "record-1",
  title: "Insurance",
  category: "Financial",
  encrypted_payload: {},
  integrity_hash: "hash",
};
const letter = {
  id: "letter-1",
  title: "A private letter",
  encrypted_payload: {},
  integrity_hash: "hash",
};
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/app");
  window.scrollTo = vi.fn();
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
  assetService.listAssets.mockResolvedValue({ data: [record] });
  familyService.listMembers.mockResolvedValue({ data: [] });
  legacyService.listStatements.mockResolvedValue({ data: [letter] });
  encryptAsset.mockResolvedValue({ cipher_text: "encrypted" });
  decryptAsset.mockResolvedValue({
    description: "Private detail",
    statement: "Private letter text",
  });
});
afterEach(cleanup);

describe("record creation", () => {
  function fillRecord() {
    fireEvent.change(screen.getByLabelText("Record title"), {
      target: { value: "Insurance" },
    });
    fireEvent.change(screen.getByLabelText("Vault secret"), {
      target: { value: "my test vault secret" },
    });
    fireEvent.change(screen.getByLabelText("Confirm secret"), {
      target: { value: "my test vault secret" },
    });
  }
  it("recovers from an encryption failure and allows a retry", async () => {
    const saved = vi.fn();
    encryptAsset.mockRejectedValueOnce(new Error("Encryption failed"));
    assetService.createAsset.mockResolvedValue({ data: [record] });
    render(
      <AssetForm session={session} onAssetAdded={saved} onCancel={() => {}} />,
    );
    fillRecord();
    fireEvent.click(screen.getByText("Save encrypted record"));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Encryption failed",
    );
    expect(screen.getByText("Save encrypted record").disabled).toBe(false);
    fireEvent.click(screen.getByText("Save encrypted record"));
    await waitFor(() => expect(saved).toHaveBeenCalledWith(record));
    expect(assetService.createAsset.mock.calls[0][0]).not.toHaveProperty(
      "description",
    );
    expect(assetService.createAsset.mock.calls[0][0]).not.toHaveProperty(
      "secret",
    );
  });
  it("blocks mismatching secrets before encryption or network writes", async () => {
    render(
      <AssetForm
        session={session}
        onAssetAdded={() => {}}
        onCancel={() => {}}
      />,
    );
    fillRecord();
    fireEvent.change(screen.getByLabelText("Confirm secret"), {
      target: { value: "a different secret" },
    });
    fireEvent.click(screen.getByText("Save encrypted record"));
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "The vault secrets don’t match. Please check both fields.",
    );
    expect(encryptAsset).not.toHaveBeenCalled();
    expect(assetService.createAsset).not.toHaveBeenCalled();
  });
});
describe("private content locking", () => {
  it("locks both record and letter content when the window loses focus", async () => {
    render(<Workspace session={session} />);
    await waitFor(() =>
      expect(screen.queryByText("Loading your vault…")).toBeNull(),
    );
    fireEvent.click(within(screen.getByRole("navigation", {name:"Main navigation"})).getByRole("button", {name:/Vault/}));
    fireEvent.click(
      within(screen.getByRole("table")).getByRole("button", { name: "Insurance" }),
    );
    fireEvent.change(screen.getByLabelText("Vault secret"), {
      target: { value: "my test vault secret" },
    });
    fireEvent.click(screen.getByText("Unlock privately"));
    expect(await screen.findByText("Private detail")).toBeTruthy();
    fireEvent.blur(window);
    expect(screen.queryByText("Private detail")).toBeNull();
    expect(screen.getByLabelText("Vault secret").value).toBe("");
    fireEvent.click(within(screen.getByRole("navigation", {name:"Main navigation"})).getByRole("button", {name:"Tasks"}));
    fireEvent.click(
      screen.getByRole("button", { name: /A private letter.*Personal letter/ }),
    );
    fireEvent.change(screen.getByLabelText("Vault secret"), {
      target: { value: "my test vault secret" },
    });
    fireEvent.click(screen.getByText("Unlock privately"));
    expect(await screen.findByText("Private letter text")).toBeTruthy();
    fireEvent.blur(window);
    expect(screen.queryByText("Private letter text")).toBeNull();
  });
  it("does not display a late decryption result after switching records", async () => {
    let finish;
    decryptAsset.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const view = render(<RecordDetail record={record} onLock={() => {}} />);
    fireEvent.change(screen.getByLabelText("Vault secret"), {
      target: { value: "my test vault secret" },
    });
    fireEvent.click(screen.getByText("Unlock privately"));
    await waitFor(() => expect(finish).toBeTypeOf("function"));
    view.rerender(
      <RecordDetail
        key="new-record"
        record={{ ...record, id: "new-record", title: "Another record" }}
        onLock={() => {}}
      />,
    );
    finish({ description: "Private detail from previous record" });
    await waitFor(() =>
      expect(
        screen.queryByText("Private detail from previous record"),
      ).toBeNull(),
    );
    expect(screen.getByLabelText("Vault secret").value).toBe("");
  });
  it("keeps old record details hidden until explicitly opened", () => {
    render(
      <RecordDetail
        record={{
          id: "old",
          title: "Older record",
          description: "Old private detail",
        }}
        onLock={() => {}}
      />,
    );
    expect(screen.queryByText("Old private detail")).toBeNull();
    fireEvent.click(screen.getByText("Show older record"));
    expect(screen.getByText("Old private detail")).toBeTruthy();
  });
});
it("shows data loading errors with a retry instead of implying an empty vault", async () => {
  familyService.listMembers.mockResolvedValueOnce({
    error: { message: "Connection failed" },
  });
  render(<Workspace session={session} />);
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("Family: Connection failed"),
  );
  expect(screen.getByRole("alert").textContent).toContain("totals may be incomplete");
  let finishRetry;
  familyService.listMembers.mockReturnValueOnce(new Promise(resolve => { finishRetry = resolve; }));
  fireEvent.click(screen.getByText("Try again"));
  expect(screen.getByRole("button", { name: "Retrying…" }).disabled).toBe(true);
  finishRetry({ data: [] });
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});
