/**
 * Reference: https://www.themoviedb.org/talk/5daf6eb0ae36680011d7e6ee
 * 
 */
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
export const allGenresMovies = categories.filter(cat => cat.type === 'movie');
export const allGenresTV = categories.filter(cat => cat.type === 'tv');

export function getGenreNameById(id) {
    const genre = categories.find(g => g.id === id);
    if (!genre) {
        return '';
    }

    return genre.name_pt;
}