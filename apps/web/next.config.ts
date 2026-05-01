import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const currentDir = fileURLToPath(import.meta.url);
const twoFoldersUp = dirname(dirname(dirname(currentDir)));

const nextConfig: NextConfig = {
  turbopack: {
    root: twoFoldersUp,
  },
  async rewrites() {
    return [
      {
        source: "/dashboard",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
