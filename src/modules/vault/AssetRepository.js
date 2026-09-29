import { supabase } from "../../supabase";

export const assetRepository = {
  async list() {
    return supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });
  },

  async create(asset) {
    return supabase.from("assets").insert([asset]).select();
  },

  async update(id, updates) {
    return supabase.from("assets").update(updates).eq("id", id).select();
  },

  async remove(id) {
    return supabase.from("assets").delete().eq("id", id);
  },

  async uploadEncryptedFile(filePath, encryptedBlob) {
    return supabase.storage.from("vault").upload(filePath, encryptedBlob);
  },

  async removeFile(filePath) {
    return supabase.storage.from("vault").remove([filePath]);
  },
};
