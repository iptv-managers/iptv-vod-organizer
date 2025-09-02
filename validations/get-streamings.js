/**
 * Checa se o filme é de um gênero específico.
 */

import { allGenresMovies } from "../utils/get-genre-id.js";

export function getStreamingsTypeId(stream, categories) {
    if (!stream) {
        return false;
    }
    const categoriesIds = [];

    const homepage = stream?.tmdb?.homepage;
    if(homepage.includes('netflix')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'netflix')
    } if(homepage.includes('amazon')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'amazon')
    }if(homepage.includes('disney')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'disney')
    }if(homepage.includes('hbo')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'hbo')
    }if(homepage.includes('paramount')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'paramount')
    }if(homepage.includes('apple')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'apple')
    }if(homepage.includes('crunchyroll')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'crunchyroll')
    }if(homepage.includes('looke')) {
        return categories.find((c) => c.type == 'stream' && c?.streamName == 'looke')
    }

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
        for (const genre of allGenresMovies) {
            const genreName = genre.name_pt.toLowerCase();

            if(stream.stream_display_name.toLowerCase().includes(genreName)) {
                categories.find((cat) => {
                    if(cat.genreId === genre.id) {
                        categoriesIds.push(cat.id);
                    }
                });
            }
        }
        // Se não encontrar o gênero, retorna um array vazio
        return [];
    }
}