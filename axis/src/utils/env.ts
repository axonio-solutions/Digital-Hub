export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;
export const isSsr = import.meta.env.SSR;

export const clientEnvs = {
	VITE_APP_URL: import.meta.env.VITE_APP_URL,
	VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
	VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
	VITE_EMAIL_PROVIDER: import.meta.env.VITE_EMAIL_PROVIDER,
};

export const serverEnvs = {
	MODE: process.env.MODE,
	JWT_SECRET: process.env.JWT_SECRET,
	EMAIL_FROM: process.env.EMAIL_FROM,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	DATABASE_URL: process.env.DATABASE_URL,
	RESEND_API_KEY: process.env.RESEND_API_KEY,
	RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
};
