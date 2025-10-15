import { betterAuth } from "better-auth";
import { reactStartCookies } from "better-auth/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";


export const auth = betterAuth({
     database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
    plugins: [reactStartCookies()] // make sure this is the last plugin in the array
})


