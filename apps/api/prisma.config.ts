// z:\Website\apps\api\prisma.config.ts
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { user, password, host, dbname } = process.env;
const encodedPassword = password ? encodeURIComponent(password) : "";

const DIRECT_URL = `postgresql://${user}:${encodedPassword}@${host}:5432/${dbname}?sslmode=require`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DIRECT_URL,
  },
});
