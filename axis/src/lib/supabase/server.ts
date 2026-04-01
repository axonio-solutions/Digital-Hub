import { createServerClient } from "@supabase/ssr";
import { parseCookies, setCookie } from "@tanstack/react-start/server";
import type { Database } from "@/types/database";
import { AUTH_COOKIE_NAME } from "@/features/auth/constants/config";
import { clientEnvs } from "@/utils/env";

export function getSupabaseServerClient() {
	return createServerClient<Database>(
		clientEnvs.VITE_SUPABASE_URL,
		clientEnvs.VITE_SUPABASE_ANON_KEY,
		{
			cookieOptions: {
				name: AUTH_COOKIE_NAME,
			},
			cookies: {
				getAll() {
					return Object.entries(parseCookies()).map(([name, value]) => ({
						name,
						value,
					}));
				},
				setAll(cookies) {
					for (const cookie of cookies) {
						setCookie(cookie.name, cookie.value);
					}
				},
			},
		},
	);
}
