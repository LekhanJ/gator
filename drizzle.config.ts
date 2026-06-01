import { defineConfig } from "drizzle-kit";
import { Config, readConfig } from "./src/config";

const config: Config = readConfig();

export default defineConfig({
  schema: "src/schema.ts",
  out: "migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.dbUrl,
  },
});