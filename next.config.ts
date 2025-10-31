import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['snowflake-sdk']
  },
  webpack: (config) => {
    config.externals.push({
      'snowflake-sdk': 'commonjs snowflake-sdk'
    })
    return config
  }
};

export default nextConfig;
