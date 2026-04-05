// @ts-check
import { nestJsConfig } from "@avgdown/eslint-config/nest-js";
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  ...nestJsConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Prisma's generated client uses `any` generics internally that we cannot change.
    // These rules would flag every prisma call across the entire codebase — disable them
    // only for the PrismaService which directly wraps the generated client.
    files: ["**/database/prisma/prisma.service.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    // main.ts uses bootstrap().catch() intentionally — NestJS compiles to CJS
    // so top-level await is not available. This is not a pattern we can change.
    files: ["src/main.ts"],
    rules: {
      "sonarjs/prefer-top-level-await": "off",
    },
  },
);
