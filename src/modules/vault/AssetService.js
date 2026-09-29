import { eventBus } from "../events/EventBus";
import { assetRepository } from "./AssetRepository";
import { ASSET_EVENTS } from "./AssetEvents";

export const assetService = {
  async listAssets() {
    return assetRepository.list();
  },

  async createAsset(asset) {
    const result = await assetRepository.create(asset);
    if (!result.error && result.data?.[0]) {
      eventBus.emit(ASSET_EVENTS.CREATED, {
        assetId: result.data[0].id,
        type: result.data[0].category || result.data[0].type,
      });
    }
    return result;
  },

  async updateAsset(id, updates) {
    const result = await assetRepository.update(id, updates);
    if (!result.error && result.data?.[0]) {
      eventBus.emit(ASSET_EVENTS.UPDATED, {
        assetId: id,
        type: result.data[0].category || result.data[0].type,
      });
    }
    return result;
  },

  async deleteAsset(id) {
    const result = await assetRepository.remove(id);
    if (!result.error) eventBus.emit(ASSET_EVENTS.DELETED, { assetId: id });
    return result;
  },

  async uploadEncryptedFile(filePath, encryptedBlob) {
    return assetRepository.uploadEncryptedFile(filePath, encryptedBlob);
  },
};
