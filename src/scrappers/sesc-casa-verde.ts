import axios from "axios";
import * as cheerio from "cheerio";
import { sortDays } from "../utils/helpers.js";

type DayMenu = {
  salada?: string;
  carne?: string;
  vegetariana?: string;
  guarnicao?: string;
  base?: string;
  fruta?: string;
  sobremesa?: string;
};

export type ScrapedMenu = {
  unidade: string;
  slug: string;
  dias: { day: string; menu: DayMenu }[];
};

function cleanText(text: string) {
  return text
    .replace(/–/g, "") // remove travessões
    .replace(/Vegano/gi, "") // remove "Vegano"
    .replace(/\s*\|\s*/g, " | ") // normaliza espaço em volta do |
    .replace(/\s+/g, " ") // remove múltiplos espaços
    .trim();
}

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

function parseDayCasaVerde(items: string[]): DayMenu {
  let carne = "";
  let vegetariana = "";
  let salada = "";
  let guarnicao = "";
  let base = "";
  let fruta = "";
  let sobremesa = "";

  for (const raw of items) {
    const text = cleanText(raw);

    // SALADA
    const saladaMatch = text.match(/salada:\s*(.*)/i);
    if (saladaMatch) {
      salada = saladaMatch[1] ?? "";
      continue;
    }

    // CARNE
    const carneMatch = text.match(/op[cç][aã]o com carne:\s*(.*)/i);
    if (carneMatch) {
      carne = carneMatch[1] ?? "";
      continue;
    }

    // VEGETARIANA
    const vegMatch = text.match(/op[cç][aã]o vegetariana:\s*(.*)/i);
    if (vegMatch) {
      vegetariana = vegMatch[1] ?? "";
      continue;
    }

    // GUARNIÇÃO
    const guarnicaoMatch = text.match(/guarni[cç][aã]o:\s*(.*)/i);
    if (guarnicaoMatch) {
      guarnicao = guarnicaoMatch[1] ?? "";
      continue;
    }

    // SOBREMESA
    const sobremesaMatch = text.match(/sobremesa:\s*(.*)/i);
    if (sobremesaMatch) {
      sobremesa = sobremesaMatch[1] ?? "";
      continue;
    }

    // FRUTA
    const frutaMatch = text.match(/fruta:\s*(.*)/i);
    if (frutaMatch) {
      fruta = frutaMatch[1] ?? "";
      continue;
    }

    // BASE
    if (text.toLowerCase().includes("arroz")) {
      base = text;
    }
  }

  return {
    salada,
    carne,
    vegetariana,
    guarnicao,
    base,
    fruta,
    sobremesa,
  };
}

function extractDay(text: string): string | null {
  const match = text.match(
    /\d{2}\/\d{2}\s*\((segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado|domingo)\)/i,
  );

  if (match) {
    return match[1]?.toLowerCase() ?? "";
  }

  return null;
}

export async function scrapeSescCasaVerde(): Promise<ScrapedMenu> {
  const url =
    "https://www.sescsp.org.br/editorial/cardapio-semanal-sesc-casa-verde/";

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const diasBrutos: { day: string; items: string[] }[] = [];

  let currentDay: { day: string; items: string[] } | null = null;

  $(".principal--post--conteudo")
    .children()
    .each((_, el) => {
      const tag = el.tagName;

      // 🔹 Se for <p>
      if (tag === "p") {
        const text = $(el).text().trim();
        processText(text);
      }

      // 🔹 Se for <ol>, percorre os <li>
      if (tag === "ol") {
        $(el)
          .find("li")
          .each((_, li) => {
            const text = $(li).text().trim();
            processText(text);
          });
      }
    });

  function processText(text: string) {
    if (!text) return;

    const dayName = extractDay(text);

    // 🔹 Detecta novo dia
    if (dayName) {
      if (text.toLowerCase().includes("fechada")) {
        currentDay = null;
        return;
      }

      currentDay = {
        day: dayName,
        items: [],
      };

      diasBrutos.push(currentDay);
      return;
    }

    // 🔹 Adiciona item ao dia atual
    if (currentDay) {
      currentDay.items.push(text);
    }
  }

  const diasEstruturados: Record<string, DayMenu> = {};

  for (const dia of diasBrutos) {
    diasEstruturados[dia.day] = parseDayCasaVerde(dia.items);
  }

  const unidade = "Sesc Casa Verde";

  return {
    unidade,
    slug: slugify(unidade),
    dias: sortDays(diasEstruturados),
  };
}
