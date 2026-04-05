import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://awdsyhxdnyfilnzamflt.supabase.co";
const supabaseAnonKey = "sb_publishable_xUdDSnmkiYJQHVfb8gO8Gw_hMoHkr6K";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
