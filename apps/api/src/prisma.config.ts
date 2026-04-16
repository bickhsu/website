// z:\Website\apps\api\prisma.config.ts
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const { user, password, host: DB_HOST, dbname } = process.env;
const encodedPassword = password ? encodeURIComponent(password) : "";
delete process.env.host;

export const DIRECT_URL = `postgresql://${user}:${encodedPassword}@${DB_HOST}:5432/${dbname}?sslmode=require`;
export const DATABASE_URL = `postgresql://${user}:${encodedPassword}@${DB_HOST}:6543/${dbname}?pgbouncer=true`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: DIRECT_URL
  },
});
