import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
      SNOWFLAKE_TOKEN: process.env.SNOWFLAKE_TOKEN,
    },
    eslint: {
      // ✅ This skips all ESLint checks during `next build`
      ignoreDuringBuilds: true,
    }
};

export default nextConfig;
