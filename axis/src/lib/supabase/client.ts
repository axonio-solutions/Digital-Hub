import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { AUTH_COOKIE_NAME } from "@/features/auth/constants/config";
import { clientEnvs } from "@/utils/env";

export function getSupabaseBrowserClient() {
	return createBrowserClient<Database>(
		clientEnvs.VITE_SUPABASE_URL,
		clientEnvs.VITE_SUPABASE_ANON_KEY,
		{
			cookieOptions: { name: AUTH_COOKIE_NAME },
		},
	);
}
