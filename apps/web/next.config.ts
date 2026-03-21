import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname } from "path";

const currentDir = fileURLToPath(import.meta.url);
const twoFoldersUp = dirname(dirname(dirname(currentDir)));

const nextConfig: NextConfig = {
  turbopack: {
    root: twoFoldersUp,
  },
};

export default nextConfig;
