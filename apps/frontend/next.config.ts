import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@scholatempus/shared", "@scholatempus/eden"],
};

export default nextConfig;
