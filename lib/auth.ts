"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Auth is optional. With env unset the whole app still works (login skipped);
// with it set, the login gate + sessions activate. No fake fallback.
export const authEnabled = Boolean(URL && KEY);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!authEnabled) return null;
  if (!client) client = createBrowserClient(URL!, KEY!);
  return client;
}
