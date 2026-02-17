import { scrapeBySlug } from "./scrappers/index.js";

async function testScraper() {
  const urls = {
    // "sesc-24-de-maio":
    //   "https://www.sescsp.org.br/editorial/cardapio-semanal-sesc-24-de-maio-2/",
    "sesc-casa-verde":
      "https://www.sescsp.org.br/editorial/cardapio-semanal-sesc-casa-verde/",
  };

  console.log("==================================================");

  try {
    const scraped = await scrapeBySlug("sesc-casa-verde");
    // const scraped = await scrapeBySlug("sesc-24-de-maio");

    console.log("✅ Resultado bruto do scraper:");
    console.log(scraped);

    console.log("\n🔹 Dias extraídos:");
    Object.entries(scraped).forEach(([dia, items]) => {
      console.log(`${dia}:`, items);
    });
  } catch (err) {
    console.error("❌ Erro ao scrappear:", err);
  }
}

testScraper();
