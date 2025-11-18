import {
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  phoneNumberClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth.ts";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient(),
    multiSessionClient(),
    magicLinkClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;

export const { signIn, signUp, useSession, signOut } = createAuthClient();
