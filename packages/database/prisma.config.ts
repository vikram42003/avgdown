import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
