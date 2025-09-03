export function getYears(stream, categories) {
    if(!stream) return [];
    const filtercat = categories.filter((cat) => cat.type === 'year');
    const catIdYears = [];

    const tmdbYear = stream?.tmdb?.release_date ?? stream.tmdb.first_air_date;
    const releaseYear = tmdbYear ? tmdbYear.substring(0, 4) : null;
    const year = (stream?.year?.length > 0 ? parseInt(stream.year) : null) || (releaseYear ? parseInt(releaseYear) : null);
    
    for(const cat of filtercat) {
        if (!isNaN(year)) {
            if(cat.year === year) {
                catIdYears.push(cat.id);
            }
        }
    }
    return catIdYears;
}