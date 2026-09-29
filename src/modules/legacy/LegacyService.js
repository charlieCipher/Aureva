import { supabase } from "../../supabase";

export const legacyService = {
  listStatements() {
    return supabase.from("legacy_statements").select("*").order("updated_at", { ascending: false });
  },

  createStatement(statement) {
    return supabase.from("legacy_statements").insert(statement).select().single();
  },

  listShieldRequests() {
    return supabase.from("shield_requests").select("*").order("created_at", { ascending: false });
  },

  createShieldRequest(request) {
    return supabase.from("shield_requests").insert(request).select().single();
  },

  resolveShieldRequest(id, status) {
    return supabase.from("shield_requests").update({ status, resolved_at: new Date().toISOString() }).eq("id", id).select().single();
  },
};
