import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import {
  emailOTP,
  magicLink,
  multiSession,
  openAPI,
  phoneNumber,
  username,
} from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  appName: "lms",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      sendMagicLink({ email, token, url }, request) {
        // Send email with magic link
      },
    }),
    openAPI(),
    multiSession(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, request) {
        // Send email with OTP
      },
    }),
    phoneNumber(),
    username(),
    nextCookies(),
  ],
});
