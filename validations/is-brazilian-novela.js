import stringSimilarity from "string-similarity";
import { cleanName } from "../utils/clean-name.js";

const brazilianNovelaKeywords = [
  "Avenida Brasil",
  "O Clone",
  "Caminho das Índias",
  "Senhora do Destino",
  "Tieta",
  "Roque Santeiro",
  "Vale Tudo",
  "Terra Nostra",
  "Laços de Família",
  "Explode Coração",
  "Rei do Gado",
  "Mulheres Apaixonadas",
  "Amor à Vida",
  "Alma Gêmea",
  "Celebridade",
  "América",
  "Pantanal",
  "Esperança",
  "Gabriela",
  "Anjo Mau",
  "Cheias de Charme",
  "Sete Vidas",
  "A Força do Querer",
  "Fina Estampa",
  "Império",
  "Carrossel",
  "Chiquititas",
  "Rebelde",
  "Malhação",
];

export function isBrazilianNovela(stream) {
  let score = 0;

  if (stream?.tmdb?.genre_ids?.includes(10766)) {
    score += 3;
  }

  if (stream?.tmdb?.origin_country?.some(c => c === "BR")) {
    score += 2;
  }

  const title = cleanName(stream?.title?.toLowerCase()) ?? cleanName(stream?.stream_display_name?.toLowerCase());
  const match = stringSimilarity.findBestMatch(title, brazilianNovelaKeywords.map(n => n.toLowerCase()));
  if (match.bestMatch.rating > 0.4) {
    score += 1;
  }

  if (stream?.category_names?.toLowerCase()?.includes('novela') && !stream?.category_names?.toLowerCase()?.includes('turca')) {
    return true;
  }

  // só retorna true se categoria + país ou categoria + nome
  return score >= 3;
}
