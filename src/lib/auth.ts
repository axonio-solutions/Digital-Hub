import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { admin, customSession } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      user_type: {
        type: "string",
        required: false,
        input: true,
      },
      account_status: {
        type: "string",
        required: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      storeName: {
        type: "string",
        required: false,
        input: true,
      },
      wilaya: {
        type: "string",
        required: false,
        input: true,
      },
      whatsappNumber: {
        type: "string",
        required: false,
        input: true,
      },
      address: {
        type: "string",
        required: false,
        input: true,
      },
      city: {
        type: "string",
        required: false,
        input: true,
      },
      companyAddress: {
        type: "string",
        required: false,
        input: true,
      },
      commercialRegister: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    admin(),
    customSession(async ({ user, session }) => {
      return {
        user,
        session,
      };
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Map user_type to the secure role field during registration
          // This safely allows 'buyer' and 'seller' roles without allowing 'admin'
          if (user.user_type === "buyer" || user.user_type === "seller") {
            return {
              data: {
                ...user,
                role: user.user_type
              }
            };
          }
          return { data: user };
        }
      }
    }
  }
});

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  user_type?: string | null;
  account_status?: string | null;
  phone?: string | null;
  storeName?: string | null;
  companyAddress?: string | null;
  commercialRegister?: string | null;
  address?: string | null;
  city?: string | null;
  wilaya?: string | null;
  whatsappNumber?: string | null;
  preferredLanguage?: string | null;
  isDeactivated?: boolean | null;
}

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session.session;
// Use the manually defined User interface for better DX and consistency
// export type User = typeof auth.$Infer.Session.user;


