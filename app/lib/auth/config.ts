import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import bcrypt from "bcryptjs";
import { initializeDB, schema } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(initializeDB as any, {
    provider: "sqlite",
    schema: {
      user: schema.users,
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async (data: { hash: string; password: string }) => {
        return await bcrypt.compare(data.password, data.hash);
      },
    },
  },
  socialProviders: {
    // You can add social providers here later if needed
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
      },
      role: {
        type: "string",
        defaultValue: "user",
      },
      verified: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
});