import { createBrowserClient } from "@supabase/ssr";

/** Cliente de Supabase para Client Components. Una instancia por import. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
