import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { getOrCreateMenu } from "./menuService.js";
import { scrapeBySlug } from "./scrappers/index.js";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

app.post("/menu", async (req, res) => {
  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: "Slug é obrigatório" });
    }

    console.log("🔎 Atualizando:", slug);

    const scraped = await scrapeBySlug(slug);

    const saved = await prisma.weeklyMenu.upsert({
      where: { slug: scraped.slug },
      update: {
        unit: scraped.unidade,
        data: scraped,
      },
      create: {
        slug: scraped.slug,
        unit: scraped.unidade,
        data: scraped,
      },
    });

    return res.json({
      message: "Cardápio atualizado",
      data: saved,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar cardápio" });
  }
});

app.post("/menu/update-all", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const slugs = ["sesc-casa-verde", "sesc-24-de-maio"];

    for (const slug of slugs) {
      const scraped = await scrapeBySlug(slug);

      await prisma.weeklyMenu.upsert({
        where: { slug },
        update: {
          unit: scraped.unidade,
          data: scraped,
        },
        create: {
          slug,
          unit: scraped.unidade,
          data: scraped,
        },
      });
    }

    return res.json({ message: "Cardápios atualizados" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar" });
  }
});

app.get("/menu/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const menu = await getOrCreateMenu(slug);

    console.log(menu);

    return res.json(menu);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      error: "Unidade não encontrada",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
