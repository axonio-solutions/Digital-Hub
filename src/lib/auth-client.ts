import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || "http://localhost:5173",
  plugins: [customSessionClient<typeof auth>()],
});

export const { 
  useSession, 
  signIn, 
  signOut, 
  signUp,
  getSession,
} = authClient;

