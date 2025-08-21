export function getYears(stream, categories) {
    const filtercat = categories.filter((cat) => cat.type === 'year');
    const catIdYears = [];

    const releaseYear = stream.tmdb?.release_date ? stream.tmdb.release_date.substring(0, 4) : null;
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