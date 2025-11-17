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
  baseURL: "http://localhost:3000",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
    phoneNumberClient(),
    emailOTPClient(),
    multiSessionClient(),
    magicLinkClient(),
  ],
});

export const { signIn, signUp, useSession } = createAuthClient();
