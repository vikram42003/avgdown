import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], 
  clean: true,
  dts: false, // Skip DTS generation (we use raw source for types)
  external: ["@prisma/client", "@prisma/adapter-neon", "prisma", "@prisma/client-runtime-utils"]
});
