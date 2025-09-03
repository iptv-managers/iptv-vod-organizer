import stringSimilarity from "string-similarity";
import { cleanName } from "../utils/clean-name.js";

// Lista de palavras/frases associadas a novelas turcas
const turkishNovelaKeywords = [
  "O Famoso Alfaiate",
  "Erkenci Kuş",
  "Próximo!",
  "Uma Nova Mulher",
  "Lua Cheia",
  "Táticas de amor",
  "8 em Istambul",
  "Amor Eterno",
  "kara sevda",
  "Between the World and Us",
  "Black and White Love",
  "Gonul",
  "Kuzey Güney",
  "Amor Proibido",
  "O Último Guardião",
  "Love 101",
  "You Knock on My Door",
  "Cati Kati Ask",
  "O Segredo do Comissário",
  "Medcezir",
  "Ezel",
  "BÖRÜ – Esquadrão Lobo",
  "Aşk Laftan Anlamaz",
  "Até a morte",
  "Asi",
  "O Segredo do Templo",
  "Intersection",
  "vidas partidas",
  "o indomável amor sem limites",
  "chamas do destino",
  "meu nome é farah",
  "emanet",
  "doce veneno",
  "andropausa",
  "amor de aluguel",
  "a princesa guerreira destan",
  "asla vasge",
  "o bravo e a bela",
  "bandeira vermelha",
  "o canto do pássaro",
  "sr errado",
];

export function isTurkishNovela(stream) {
  let score = 0;

  const match = stringSimilarity.findBestMatch(cleanName(stream?.title?.toLowerCase()) ?? cleanName(stream.stream_display_name?.toLowerCase()), turkishNovelaKeywords);
  if (match.bestMatch.rating > 0.6) { 
    // 0.6 é básico, necessario verificar
    score += 1;
  }

  if (stream?.tmdb?.origin_country?.some(c => c === "TR")) {
    score += 1;
  }

  if (stream?.category_names?.toLowerCase()?.includes('turca')) {
    return true;
  }

  return score > 0;
}
