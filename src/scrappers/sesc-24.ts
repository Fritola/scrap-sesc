import axios from "axios";
import * as cheerio from "cheerio";
import { sortDays } from "../utils/helpers.js";

type DayMenu = {
  salada?: string;
  carne?: string;
  vegetariana?: string;
  guarnicao?: string;
  base?: string;
};

export type ScrapedMenu = {
  unidade: string;
  slug: string;
  dias: { day: string; menu: DayMenu }[];
};

function cleanText(text: string) {
  return text.replace(/\s+/g, " ").replace("Vegano", "").trim();
}

function parseDay(items: string[]): DayMenu {
  return {
    salada: cleanText(
      items.find((i) => i.includes("Salada:"))?.replace("– Salada:", "") || "",
    ),
    carne: cleanText(
      items
        .find((i) => i.includes("Opção com carne:"))
        ?.replace(/^\d+\.\s*Opção com carne:/, "") || "",
    ),
    vegetariana: cleanText(
      items
        .find((i) => i.includes("Opção vegetariana:"))
        ?.replace(/^\d+\.\s*Opção vegetariana:/, "") || "",
    ),
    guarnicao: cleanText(
      items
        .find((i) => i.includes("Guarnição:"))
        ?.replace("– Guarnição:", "") || "",
    ),
    base: cleanText(items.find((i) => i.includes("Arroz")) || ""),
  };
}

function extractDayName(dayString: string) {
  const match = dayString.match(/\((.*?)\)/);
  return match ? match[1]?.toLowerCase() : dayString;
}

export async function scrapeSesc24Maio(): Promise<ScrapedMenu> {
  const url =
    "https://www.sescsp.org.br/editorial/cardapio-semanal-sesc-24-de-maio-2/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const diasBrutos: { day: string; items: string[] }[] = [];
  let currentDay: { day: string; items: string[] } | null = null;

  $(".principal--post--conteudo p").each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    if (
      text.includes("Serviço Social do Comércio") ||
      text.includes("Política de Cookies") ||
      text.includes("Sesc São Paulo por aí")
    ) return;

    if (text.includes("Unidade Fechada")) {
      console.log(`⚠️ Pulando dia fechado: ${text}`);
      currentDay = null;
      return;
    }

    const dayMatch = text.match(/\d{2}\/\d{2}\s+\((.*?)\)/);
    if (dayMatch) {
      currentDay = { day: text, items: [] };
      diasBrutos.push(currentDay);
      return;
    }

    if (currentDay) {
      currentDay.items.push(text);
    }
  });

  const diasEstruturados: Record<string, DayMenu> = {};
  function slugify(text: string) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  const tituloCompleto = $(".principal--post--cabecalho--titulo")
    .first()
    .text()
    .trim();

  const unidade = tituloCompleto.split("–").pop()?.trim() || tituloCompleto;
  const slug = slugify(unidade);

  for (const dia of diasBrutos) {
    const nomeDia = extractDayName(dia.day) ?? "";
    if (dia.items.length === 0) continue;
    diasEstruturados[nomeDia] = parseDay(dia.items);
  }

  return {
    unidade: unidade,
    slug: slug,
    dias: sortDays(diasEstruturados),
  };
}
