import { scrapeSesc24Maio } from "./sesc-24.js";
import { scrapeSescCasaVerde } from "./sesc-casa-verde.js";

export async function scrapeBySlug(slug: string) {
  switch (slug) {
    case "sesc-24-de-maio":
      return scrapeSesc24Maio();

    case "sesc-casa-verde":
      return scrapeSescCasaVerde();

    default:
      throw new Error("Unidade não suportada");
  }
}
