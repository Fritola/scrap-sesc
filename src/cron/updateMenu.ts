import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { Pool } from "pg";
import { scrapeBySlug } from "../scrappers/index.js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export async function updateMenu(slug: string) {
  const scraped = await scrapeBySlug(slug);

  return prisma.weeklyMenu.upsert({
    where: { slug },
    update: {
      unit: scraped.unidade,
      data: scraped,
    },
    create: {
      unit: scraped.unidade,
      slug: scraped.slug,
      data: scraped,
    },
  });
}
