import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// YALNIZCA SUNUCU TARAFI KODLARDA ÇALIŞTIRILMALIDIR.
// Constitution §1 uyarınca service_role anahtarı asla istemci (client) tarafına aktarılmaz.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Sunucu ortamında NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY eksik."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
