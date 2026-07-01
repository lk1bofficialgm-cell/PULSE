import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Normalize the connection string defensively: some hosting dashboards store it
// wrapped in quotes or as a full `psql '...'` command. Extract from the scheme
// onward and strip stray whitespace / a trailing quote.
function cleanDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const idx = raw.indexOf("postgres");
  let url = idx >= 0 ? raw.slice(idx) : raw;
  url = url.trim().replace(/^['"]/, "").replace(/['"]$/, "");
  return url;
}

const adapter = new PrismaPg({
  connectionString: cleanDatabaseUrl(process.env.DATABASE_URL),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
