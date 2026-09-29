import { supabase } from "../../supabase";

export const familyService = {
  listMembers() {
    return supabase
      .from("family_members")
      .select("*, asset_assignments(id, status)")
      .order("created_at", { ascending: true });
  },

  addMember(member) {
    return supabase.from("family_members").insert(member).select().single();
  },

  removeMember(id) {
    return supabase.from("family_members").delete().eq("id", id);
  },

  assignAsset(assetId, familyMemberId) {
    return supabase
      .from("asset_assignments")
      .upsert(
        {
          asset_id: assetId,
          family_member_id: familyMemberId,
          status: "PENDING",
        },
        { onConflict: "asset_id,family_member_id" },
      )
      .select()
      .single();
  },
};
