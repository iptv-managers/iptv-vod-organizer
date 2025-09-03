/**
 * Aqui a gente verifica se a série (somente serie) pertence a alguma produtora
 */

export function getNetworksIds(stream, categories) {
    if (!stream) {
        return [];
    }
    const categoriesIds = [];

    for (const cat of categories) {
        const exist = stream?.tmdb?.networks?.find(n => {
            return n?.name?.toLowerCase()?.includes(cat?.streamName?.toLowerCase())
        });
        if(exist) {
            categoriesIds.push(cat.id);
            return categoriesIds;
        }
        const existInCatName = stream?.category_names?.toLowerCase()?.includes(cat?.streamName?.toLowerCase())
        if(existInCatName)
            categoriesIds.push(cat.id);
    }
    
    return categoriesIds;
}