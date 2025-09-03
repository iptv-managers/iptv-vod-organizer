/**
 * Checa se o filme é de um gênero específico.
 */

import { allGenresMovies, allGenresTV } from "../utils/get-genre-id.js";

export function getGenreIds(stream, categories, type = 'movies') {
    if (!stream) {
        return [];
    }
    const categoriesIds = [];

    if(stream.tmdb?.genres?.length > 0) {
        stream?.tmdb?.genres?.forEach((g) => {
            categories.find((cat) => {
                if(cat.genreId === g.id) {
                    categoriesIds.push(cat.id);
                }
            });
        })
        return categoriesIds;
    } else {
        const items = type == 'series' ? allGenresTV : allGenresMovies;
        for (const genre of items) {
            const genreName = genre.name_pt.toLowerCase();

            const name = stream?.stream_display_name ?? stream?.title;
            if(name.toLowerCase().includes(genreName)) {
                categories.find((cat) => {
                    if(cat.genreId === genre.id) {
                        categoriesIds.push(cat.id);
                    }
                });
            }
        }
    }
    // Se não encontrar o gênero, retorna um array vazio
    return categoriesIds;
}