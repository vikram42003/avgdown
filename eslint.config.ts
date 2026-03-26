import type { Linter } from "eslint";

/**
 * ROOT ESLINT CONFIG
 * This acts as a global stopgap to prevent the flat config from escaping the monorepo root
 * and hitting global/home directory configs (like ~/eslint.config.mjs).
 *
 * Individual packages should define their own eslint.config.ts
 */
const config: Linter.Config[] = [{ ignores: ["**/*"] }];

export default config;
