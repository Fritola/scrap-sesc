import axios from "axios";
import * as cheerio from "cheerio";

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
  dias: Record<string, any>;
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

    // Detecta início de um dia
    if (text.startsWith("Dia")) {
      currentDay = {
        day: text,
        items: [],
      };
      diasBrutos.push(currentDay);
      return;
    }

    // Se aparecer "Unidade Fechada", consideramos dia vazio
    if (text.includes("Unidade Fechada")) {
      return;
    }

    // Ignorar lixo institucional
    if (
      text.includes("Serviço Social do Comércio") ||
      text.includes("Política de Cookies") ||
      text.includes("Sesc São Paulo por aí")
    ) {
      return;
    }

    if (currentDay) {
      currentDay.items.push(text);
    }
  });

  // Converte para estrutura final
  const diasEstruturados: Record<string, DayMenu> = {};
  function slugify(text: string) {
    return text
      .normalize("NFD") // separa acentos
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
      .trim()
      .replace(/\s+/g, "-") // espaço vira -
      .replace(/-+/g, "-"); // evita múltiplos -
  }
  const tituloCompleto = $(".principal--post--cabecalho--titulo")
    .first()
    .text()
    .trim();

  const unidade = tituloCompleto.split("–").pop()?.trim() || tituloCompleto;

  const slug = slugify(unidade);

  for (const dia of diasBrutos) {
    const nomeDia = extractDayName(dia.day) || "";
    diasEstruturados[nomeDia] = parseDay(dia.items);
  }

  return {
    unidade: unidade,
    slug: slug,
    dias: diasEstruturados,
  };
}
