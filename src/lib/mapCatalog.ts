export interface MapCatalogEntry {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city' | 'region' | 'province' | 'continent';
  url: string;
  description?: string;
  bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  center?: [number, number];
  keywords?: string[];
  population?: number;
}

export const mapCatalog: MapCatalogEntry[] = [
  // World & Continents
  {
    id: 'world',
    name: 'World',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    description: 'Global map showing all countries',
    center: [0, 20],
    keywords: ['earth', 'global', 'international', 'planet'],
    population: 8000000000
  },
  {
    id: 'world-detailed',
    name: 'World (Detailed)',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'High resolution global map',
    center: [0, 20],
    keywords: ['earth', 'global', 'detailed', 'hd'],
    population: 8000000000
  },

  // United States
  {
    id: 'usa',
    name: 'United States',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'USA with state boundaries',
    bounds: [-125, 25, -66, 49],
    center: [-98, 38],
    keywords: ['us', 'usa', 'america', 'states'],
    population: 331000000
  },
  {
    id: 'usa-counties',
    name: 'United States (Counties)',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json',
    description: 'USA with county-level detail',
    bounds: [-125, 25, -66, 49],
    center: [-98, 38],
    keywords: ['us', 'usa', 'america', 'counties', 'detailed'],
    population: 331000000
  },

  // US States
  {
    id: 'california',
    name: 'California',
    type: 'state',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'California state',
    bounds: [-124.5, 32.5, -114, 42],
    center: [-119.5, 37],
    keywords: ['ca', 'west coast', 'golden state'],
    population: 39500000
  },
  {
    id: 'texas',
    name: 'Texas',
    type: 'state',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'Texas state',
    bounds: [-106.5, 25.8, -93.5, 36.5],
    center: [-99.9, 31.5],
    keywords: ['tx', 'lone star'],
    population: 29000000
  },
  {
    id: 'new-york',
    name: 'New York',
    type: 'state',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'New York state',
    bounds: [-79.8, 40.5, -71.8, 45],
    center: [-75.5, 43],
    keywords: ['ny', 'empire state', 'nyc'],
    population: 19500000
  },
  {
    id: 'florida',
    name: 'Florida',
    type: 'state',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'Florida state',
    bounds: [-87.5, 24.5, -80, 31],
    center: [-81.5, 28],
    keywords: ['fl', 'sunshine state'],
    population: 21500000
  },
  {
    id: 'illinois',
    name: 'Illinois',
    type: 'state',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'Illinois state',
    bounds: [-91.5, 37, -87.5, 42.5],
    center: [-89.5, 40],
    keywords: ['il', 'chicago'],
    population: 12700000
  },
  {
    id: 'pennsylvania',
    name: 'Pennsylvania',
    type: 'state',
    url: 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json',
    description: 'Pennsylvania state',
    bounds: [-80.5, 39.7, -74.7, 42],
    center: [-77.5, 41],
    keywords: ['pa', 'keystone state'],
    population: 12800000
  },

  // European Countries
  {
    id: 'europe',
    name: 'Europe',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'European continent',
    bounds: [-10, 36, 40, 71],
    center: [15, 54],
    keywords: ['eu', 'european union'],
    population: 750000000
  },
  {
    id: 'united-kingdom',
    name: 'United Kingdom',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'United Kingdom',
    bounds: [-8, 50, 2, 59],
    center: [-2, 54],
    keywords: ['uk', 'britain', 'england', 'scotland', 'wales'],
    population: 67000000
  },
  {
    id: 'france',
    name: 'France',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'France',
    bounds: [-5, 42, 8, 51],
    center: [2.5, 47],
    keywords: ['fr', 'french', 'paris'],
    population: 67000000
  },
  {
    id: 'germany',
    name: 'Germany',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Germany',
    bounds: [6, 47, 15, 55],
    center: [10.5, 51],
    keywords: ['de', 'deutsch', 'berlin'],
    population: 83000000
  },
  {
    id: 'spain',
    name: 'Spain',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Spain',
    bounds: [-9, 36, 4, 44],
    center: [-3.7, 40.4],
    keywords: ['es', 'spanish', 'madrid', 'barcelona'],
    population: 47000000
  },
  {
    id: 'italy',
    name: 'Italy',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Italy',
    bounds: [7, 36, 19, 47],
    center: [12.5, 42.8],
    keywords: ['it', 'italian', 'rome', 'milan'],
    population: 60000000
  },

  // Asian Countries
  {
    id: 'asia',
    name: 'Asia',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Asian continent',
    bounds: [25, -10, 150, 55],
    center: [100, 30],
    keywords: ['asian'],
    population: 4600000000
  },
  {
    id: 'china',
    name: 'China',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'China',
    bounds: [73, 18, 135, 53],
    center: [104, 35],
    keywords: ['cn', 'chinese', 'beijing'],
    population: 1400000000
  },
  {
    id: 'india',
    name: 'India',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'India',
    bounds: [68, 7, 97, 35],
    center: [78, 20],
    keywords: ['in', 'indian', 'delhi', 'mumbai'],
    population: 1380000000
  },
  {
    id: 'japan',
    name: 'Japan',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Japan',
    bounds: [129, 31, 146, 45],
    center: [138, 36],
    keywords: ['jp', 'japanese', 'tokyo'],
    population: 126000000
  },

  // Other Major Countries
  {
    id: 'canada',
    name: 'Canada',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Canada',
    bounds: [-141, 42, -52, 83],
    center: [-96, 62],
    keywords: ['ca', 'canadian'],
    population: 38000000
  },
  {
    id: 'australia',
    name: 'Australia',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Australia',
    bounds: [113, -43, 153, -10],
    center: [133, -27],
    keywords: ['au', 'aussie', 'sydney', 'melbourne'],
    population: 25000000
  },
  {
    id: 'brazil',
    name: 'Brazil',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Brazil',
    bounds: [-74, -33, -35, 5],
    center: [-52, -10],
    keywords: ['br', 'brazilian', 'south america'],
    population: 212000000
  },
  {
    id: 'mexico',
    name: 'Mexico',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Mexico',
    bounds: [-117, 14, -86, 32],
    center: [-102, 23],
    keywords: ['mx', 'mexican'],
    population: 128000000
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'South Africa',
    bounds: [16, -35, 33, -22],
    center: [24, -29],
    keywords: ['za', 'africa'],
    population: 59000000
  },
  {
    id: 'russia',
    name: 'Russia',
    type: 'country',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'Russia',
    bounds: [19, 41, 180, 81],
    center: [100, 60],
    keywords: ['ru', 'russian', 'moscow'],
    population: 146000000
  },

  // Africa
  {
    id: 'africa',
    name: 'Africa',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'African continent',
    bounds: [-18, -35, 52, 37],
    center: [20, 0],
    keywords: ['african'],
    population: 1300000000
  },

  // South America
  {
    id: 'south-america',
    name: 'South America',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'South American continent',
    bounds: [-82, -56, -35, 13],
    center: [-60, -15],
    keywords: ['latin america'],
    population: 430000000
  },

  // North America
  {
    id: 'north-america',
    name: 'North America',
    type: 'continent',
    url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json',
    description: 'North American continent',
    bounds: [-168, 15, -52, 72],
    center: [-100, 45],
    keywords: ['americas'],
    population: 580000000
  },
];
