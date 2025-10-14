import { betterAuth } from "better-auth";
import { reactStartCookies } from "better-auth/react-start";
import { Pool } from "pg";
//auth 
export const auth = betterAuth({
     database: new Pool({ 
 connectionString: process.env.DATABASE_URL 
 }),
    plugins: [reactStartCookies()] // make sure this is the last plugin in the array
})


