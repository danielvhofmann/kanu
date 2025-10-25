import { mapCatalog, MapCatalogEntry } from './mapCatalog';

export const searchMaps = (query: string): MapCatalogEntry[] => {
  if (!query || query.trim().length === 0) {
    // Return popular maps when no query
    return mapCatalog.slice(0, 10);
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  const results = mapCatalog
    .map(map => {
      let score = 0;
      const nameLower = map.name.toLowerCase();
      
      // Exact match - highest priority
      if (nameLower === normalizedQuery) {
        score = 1000;
      }
      // Starts with query - high priority
      else if (nameLower.startsWith(normalizedQuery)) {
        score = 500;
      }
      // Contains query - medium priority
      else if (nameLower.includes(normalizedQuery)) {
        score = 250;
      }
      // Keyword match - lower priority
      else if (map.keywords?.some(kw => kw.toLowerCase().includes(normalizedQuery))) {
        score = 100;
      }
      // Description match - lowest priority
      else if (map.description?.toLowerCase().includes(normalizedQuery)) {
        score = 50;
      }
      
      // Boost by population (for relevance)
      if (score > 0 && map.population) {
        score += Math.log10(map.population) * 5;
      }
      
      return { map, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map(result => result.map);
  
  return results;
};

export const getPopularMaps = (): MapCatalogEntry[] => {
  return mapCatalog
    .filter(map => ['world', 'usa', 'europe', 'asia', 'united-kingdom', 'france', 'germany', 'china', 'india', 'canada'].includes(map.id))
    .sort((a, b) => (b.population || 0) - (a.population || 0));
};
