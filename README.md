# XUI-VOD-ORGANIZER

[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue?logo=telegram)](https://t.me/xuimanagers)

Através desse projeto você pode reorganizar os seus VODS presentes no XUI.one como você quiser.
Com o código fonte completamente aberto, e seguro, você pode organizar os seus vods localmente em seu computador.

## Por que?
Voce deve estar se perguntando, por que ter um projeto gratuito e de codigo fonte aberto? 
Sou programador, e fiquei cansado de verem pessoas cobrando fortunas por projetos mal feitos, ou roubados de outros dev, Então, por que não, fazer algo completamente gratuito, em que posso ajudar outras pessoas

## Esse projeto te ajudou?
Se esse projeto te ajudou, considere fazer uma doação para meu trabalho, para que eu continue trazendo novidades, basta acessar o Github Sponsors nesse link:
https://github.com/sponsors/icleitoncosta

## Iniciando
Baixe os arquivos aqui: https://github.com/xui-managers/iptv-vod-organizer/releases
Altere o arquivo cat-movies.json e cat-series.json como voce preferir.
As categorias ficaram ordenadas de acordo com a ordem que você coloca nos arquivos cat-movies.json e cat-series.json

## Configuração
Crie e altere o arquivo .env com suas informações. (obrigatório ter uma API TMDB, ou use essa padrão, mas lembre-se que ela pode ser bloqueada a qualquer momento, entao, de preferencia use uma API TMDB propria)
```
# Configurações do Banco de Dados MySQL
DB_HOST=""
DB_USER="root"
DB_PASSWORD=""
DB_NAME="xui"

TMDB_API_KEY="19041a97d3fbf32a60a77a486022e7ca"
TMDB_LANGUAGE="pt-BR"
OUTPUT_FILE="movies.json"
```

## Abrindo
Existem duas formas de fazer o projeto rodar, a primeira e mais fácil: Utilize o arquivo executavel `XUI Organizer.exe`, ele irá executar o projeto e voce pode selecionar o que deseja fazer, sincronizar filmes ou series, a outra é instalando o NodeJs, NPM, etc, porém, apenas para desenvolvedores, se você é um, com certeza, já sabe o processo.

### Formas de configuração
```
// por ano
{
    "id": 1,
    "name": "Lançamentos 2025",
    "type": "year",
    "year": 2025
},

// por gênero (busque o genreId aqui no fim dessa página)
{
    "id": 6,
    "name": "Filmes | Animação",
    "type": "genre",
    "genreId": 16
},

// por produtora (a produtora basta colocar em minusculo o streamName, que irá buscar no tmdb o nome da produtora)
{
    "id": 4,
    "name": "Séries | Globoplay",
    "type": "stream",
    "streamName": "globoplay"
},

// adultos
{
    "id": 6969,
    "name": "Filmes | [XXX] Adultos",
    "type": "adult"
}

// series especiais (categorias especiais)
{
    "id": 12,
    "name": "Séries | Novelas",
    "type": "novelasbr"
},
{
    "id": 13,
    "name": "Séries | Novelas Turcas",
    "type": "novelasturcas"
},
{
    "id": 14,
    "name": "Séries | Doramas",
    "type": "doramas"
},
{
    "id": 14,
    "name": "Séries | Animes",
    "type": "animes"
},

```

### Informação importante
Sempre deixe uma categoria para os não categorizados, pois caso o sistema não encontre de forma automatica, ele irá colocar nessa categoria, e o usuario consegue achar.

```
{
    "id": 15000,
    "name": "Séries | Outras Produtoras",
    "type": "uncategorized"
},
```


### Todos os tipos de generos ids de filmes e series
```
const categories = [
  // MOVIES
  { type: 'movie', id: 28, name_en: 'Action', name_pt: 'Ação' },
  { type: 'movie', id: 12, name_en: 'Adventure', name_pt: 'Aventura' },
  { type: 'movie', id: 16, name_en: 'Animation', name_pt: 'Animação' },
  { type: 'movie', id: 35, name_en: 'Comedy', name_pt: 'Comédia' },
  { type: 'movie', id: 80, name_en: 'Crime', name_pt: 'Crime' },
  { type: 'movie', id: 99, name_en: 'Documentary', name_pt: 'Documentário' },
  { type: 'movie', id: 18, name_en: 'Drama', name_pt: 'Drama' },
  { type: 'movie', id: 10751, name_en: 'Family', name_pt: 'Família' },
  { type: 'movie', id: 14, name_en: 'Fantasy', name_pt: 'Fantasia' },
  { type: 'movie', id: 36, name_en: 'History', name_pt: 'História' },
  { type: 'movie', id: 27, name_en: 'Horror', name_pt: 'Terror' },
  { type: 'movie', id: 10402, name_en: 'Music', name_pt: 'Música' },
  { type: 'movie', id: 9648, name_en: 'Mystery', name_pt: 'Mistério' },
  { type: 'movie', id: 10749, name_en: 'Romance', name_pt: 'Romance' },
  { type: 'movie', id: 878, name_en: 'Science Fiction', name_pt: 'Ficção Científica' },
  { type: 'movie', id: 10770, name_en: 'TV Movie', name_pt: 'Filme para TV' },
  { type: 'movie', id: 53, name_en: 'Thriller', name_pt: 'Suspense' },
  { type: 'movie', id: 10752, name_en: 'War', name_pt: 'Guerra' },
  { type: 'movie', id: 37, name_en: 'Western', name_pt: 'Faroeste' },

  // TV SHOWS
  { type: 'tv', id: 10759, name_en: 'Action & Adventure', name_pt: 'Ação e Aventura' },
  { type: 'tv', id: 16, name_en: 'Animation', name_pt: 'Animação' },
  { type: 'tv', id: 35, name_en: 'Comedy', name_pt: 'Comédia' },
  { type: 'tv', id: 80, name_en: 'Crime', name_pt: 'Crime' },
  { type: 'tv', id: 99, name_en: 'Documentary', name_pt: 'Documentário' },
  { type: 'tv', id: 18, name_en: 'Drama', name_pt: 'Drama' },
  { type: 'tv', id: 10751, name_en: 'Family', name_pt: 'Família' },
  { type: 'tv', id: 10762, name_en: 'Kids', name_pt: 'Infantil' },
  { type: 'tv', id: 9648, name_en: 'Mystery', name_pt: 'Mistério' },
  { type: 'tv', id: 10763, name_en: 'News', name_pt: 'Notícias' },
  { type: 'tv', id: 10764, name_en: 'Reality', name_pt: 'Reality Show' },
  { type: 'tv', id: 10765, name_en: 'Sci-Fi & Fantasy', name_pt: 'Ficção Científica e Fantasia' },
  { type: 'tv', id: 10766, name_en: 'Soap', name_pt: 'Novela' },
  { type: 'tv', id: 10767, name_en: 'Talk', name_pt: 'Talk Show' },
  { type: 'tv', id: 10768, name_en: 'War & Politics', name_pt: 'Guerra e Política' },
  { type: 'tv', id: 37, name_en: 'Western', name_pt: 'Faroeste' },
];
```