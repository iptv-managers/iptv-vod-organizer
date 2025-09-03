import stringSimilarity from "string-similarity";
import { cleanName } from "../utils/clean-name.js";

// Lista de palavras/frases associadas a novelas turcas
const turkishNovelaKeywords = [
    "Esaret",
    "Coracao Ferido",
    "Adim Farah",
    "Yargı Segredos de Familia",
    "Flores de Sangue",
    "O Canto do Passaro",
    "Camaleoes",
    "O Indomavel Amor Sem Limites",
    "Intersection",
    "Terra Amarga",
    "Ruzgarli Tepe",
    "O Amor Nao Entende Palavras",
    "Meu caminho e te amar",
    "Amor Proibido",
    "Amor Sem Fim",
    "O Segredo de Feriha",
    "Yabani",
    "O Outro Lado do Amor",
    "Nehir Presa do Amor",
    "O Ultimo Verao",
    "A Filha do Embaixador",
    "Um Milagre",
    "Prisao de Mentiras",
    "Iludida",
    "Vidas Ocultas",
    "Forca de Mulher",
    "Emanet",
    "Mae",
    "Minha Menina",
    "Violeta como O Mar",
    "Quase Anjos",
    "Sen Anlat Karadeniz",
    "Toprak ile Fidan",
    "A Sonhadora",
    "Dolunay",
    "A Agencia",
    "Simplemente Maria",
    "Marasli O Protetor",
    "O Otomano",
    "Cabo Amor e Desejo",
    "Amor e Honra",
    "Sera Isso Amor",
    "Sr Errado",
    "Meu Lar Meu Destino",
    "Jogos do Destino",
    "O Famoso Alfaiate",
    "A Lenda de Shahmaran",
    "Love 101",
    "Ya Cok Seversen",
    "Kacis Fuga Terrorista",
    "Fatih Terim Lenda do Futebol",
    "Uma Nova Vida",
    "Hercai Amor e Vinganca",
    "Fatmagul A Forca do Amor",
    "A Noiva de Istambul",
    "Sila",
    "Minha fortuna e Te Amar",
    "Amor na Ilha",
    "O Grande Guerreiro Otomano",
    "Hayat Bazen Tatlıdır",
    "O Preco da Paixao",
    "Grande Hotel",
    "Imperio de Mentiras",
    "Uma Nova Mulher",
    "As Vidas Secretas da Família Uysal",
    "O Submarino",
    "Casamento Arranjado",
    "Ezel",
    "O Segredo do Templo",
    "Fatma",
    "De Quem Estamos Fugindo",
    "Asas da Ambicao",
    "Esqueca me se Puder",
    "8 em Istambul",
    "Passaro Madrugador",
    "kara sevda"
];

export function isTurkishNovela(stream) {
  let score = 0;

  const title = cleanName(stream?.title?.toLowerCase()) ?? cleanName(stream.stream_display_name?.toLowerCase());
  const match = stringSimilarity.findBestMatch(title, turkishNovelaKeywords.map(n => n.toLowerCase()));
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
