import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX({
  configPath: "source.config.ts",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // output: "standalone",
  // Add the packages in transpilePackages
  // transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  allowedDevOrigins: [
    "3000-firebase-lms-1763389556721.cluster-nulpgqge5rgw6rwqiydysl6ocy.cloudworkstations.dev",
  ],
};

export default withMDX(nextConfig);
