import stringSimilarity from "string-similarity";
import { cleanName } from "../utils/clean-name.js";

// Lista de doramas famosos no Brasil
const doramaKeywords = [
  "Boys Over Flowers",
  "Itaewon Class",
  "Goblin",
  "Descendants of the Sun",
  "Crash Landing on You",
  "Extraordinary Attorney Woo",
  "Strong Woman Do Bong Soon",
  "True Beauty",
  "Love Alarm",
  "Start-Up",
  "Vincenzo",
  "Kingdom",
  "My Love from the Star",
  "The Heirs",
  "All of Us Are Dead",
  "Hotel Del Luna",
  "Because This Is My First Life",
  "It's Okay to Not Be Okay",
  "Hometown Cha-Cha-Cha",
  "Mr. Sunshine",
  "The Penthouse",
  "Twenty-Five Twenty-One",
  "Uncontrollably Fond",
  "Doctor Stranger",
  "Secret Garden",
  "Coffee Prince",
  "Full House",
  "Winter Sonata",
  "a vida dupla do meu marido bilionario",
  "a mae ceo e o pai incrivel",
  "a vida secreta do meu marido bilionario",
  "jogando com as regras do multimilionario",
  "a esposa do ceo e a chefe secreta",
  "peguei um bilionario para ser meu marido"
];

export function isDorama(stream) {
  let score = 0;

  // 🎭 Categoria soap
  if (stream?.tmdb?.genre_ids?.includes(10766)) {
    score += 3;
  }

  // 🌏 País (KR, JP, CN, TW)
  if (stream?.tmdb?.origin_country?.some(c => ["KR", "JP", "CN", "TW"].includes(c))) {
    score += 2;
  }

  // 🔎 Nome
  const title = cleanName(stream?.title?.toLowerCase()) ?? cleanName(stream?.stream_display_name?.toLowerCase());
  const match = stringSimilarity.findBestMatch(title, doramaKeywords.map(n => n.toLowerCase()));
  if (match.bestMatch.rating > 0.4) {
    score += 1;
  }

  if (stream?.category_names?.toLowerCase()?.includes('dorama')) {
    return true;
  }

  // ✅ Retorna true só se realmente tiver relevância
  return score >= 3;
}