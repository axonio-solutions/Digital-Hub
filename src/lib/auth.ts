import { betterAuth } from "better-auth";
import { reactStartCookies } from "better-auth/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { admin } from "better-auth/plugins";


export const auth = betterAuth({
     database: drizzleAdapter(db, {
		provider: "pg",
		usePlural: true,
	}),
    emailAndPassword: { 
    enabled: true, 
  }, 
    plugins: [reactStartCookies() , admin()] // make sure this is the last plugin in the array
})


async function createInitialAdmin() {
  try {
    const ctx = await auth.$context;
    
    // Check if admin user already exists
    const existingAdmin = await ctx.adapter.findOne({
      model: "user",
      where: [{
        field: "email",
        value: "admin@digital-hub.com"
      }]
    });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }
    // Create admin user using Better Auth's API
    const newUser = await auth.api.createUser({
      body: {
        email: "admin@digital-hub.com",
        password: "Digitalhub",
        name: "Admin",
        role: "admin",
      },
    });
    console.log("Admin user created successfully:", newUser);
  } catch (error) {
    console.error("Failed to create admin user:", error);
  }
}
// Call the function to create admin user on startup
createInitialAdmin();

