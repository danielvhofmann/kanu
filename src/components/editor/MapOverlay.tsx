import { useState, useCallback, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, MapPin, Globe, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { searchMaps, getPopularMaps } from '@/lib/mapSearch';
import { MapCatalogEntry } from '@/lib/mapCatalog';
import * as topojson from 'topojson-client';

interface MapOverlayProps {
  onSelectBackground: (mapData: any) => void;
  onClose: () => void;
}

export const MapOverlay = ({ onSelectBackground, onClose }: MapOverlayProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapCatalogEntry[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapCatalogEntry | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with popular maps
  useEffect(() => {
    setSearchResults(getPopularMaps());
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const results = searchMaps(searchQuery);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMapSelect = useCallback((map: MapCatalogEntry) => {
    setSelectedMap(map);
    setIsLoading(true);
    
    // Auto-zoom to map bounds if available
    if (map.center) {
      setCenter(map.center);
      setZoom(map.type === 'city' ? 8 : map.type === 'state' ? 4 : map.type === 'country' ? 2 : 1);
    } else {
      setZoom(1);
      setCenter([0, 0]);
    }
    
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleMoveEnd = useCallback((position: { coordinates: [number, number], zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  }, []);

  const handleImportMap = useCallback(async () => {
    if (!selectedMap) return;
    
    setIsImporting(true);
    
    try {
      // Fetch the TopoJSON data
      const response = await fetch(selectedMap.url);
      if (!response.ok) throw new Error('Failed to fetch map data');
      
      const topoData = await response.json();
      
      // Extract the first feature collection from the TopoJSON
      const objectKey = Object.keys(topoData.objects)[0];
      const geoJson = topojson.feature(topoData, topoData.objects[objectKey]);
      
      onSelectBackground({
        mapData: selectedMap,
        geography: geoJson,
        zoom,
        center,
      });
      
      toast.success(`Imported ${selectedMap.name} as network background`);
      onClose();
    } catch (error) {
      console.error('Error importing map:', error);
      toast.error('Failed to import map. Please try again.');
    } finally {
      setIsImporting(false);
    }
  }, [selectedMap, zoom, center, onSelectBackground, onClose]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'continent': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'country': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'state': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'city': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header with Search */}
        <div className="flex flex-col gap-4 p-4 border-b border-border bg-card/50 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Import Map Background
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Search for a city, region, state, or country to use as your network background
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for maps... (e.g., 'Paris', 'California', 'Japan')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Search Results Sidebar */}
          <div className="w-80 flex flex-col gap-3">
            <div className="text-sm font-medium text-muted-foreground">
              {searchQuery ? `Search Results (${searchResults.length})` : 'Popular Maps'}
            </div>
            <ScrollArea className="flex-1 border border-border rounded-lg bg-card">
              <div className="p-2 space-y-1">
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No maps found</p>
                    <p className="text-xs mt-1">Try searching for a country, state, or city</p>
                  </div>
                ) : (
                  searchResults.map((map) => (
                    <button
                      key={map.id}
                      onClick={() => handleMapSelect(map)}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedMap?.id === map.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'hover:bg-accent border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{map.name}</div>
                          {map.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {map.description}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className={`shrink-0 text-xs ${getTypeColor(map.type)}`}>
                          {map.type}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Map Preview Area */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                {selectedMap ? `Preview: ${selectedMap.name}` : 'Select a map to preview'}
              </div>
              {selectedMap && (
                <Button onClick={handleImportMap} disabled={isImporting} className="gap-2">
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Import Map
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex-1 rounded-lg overflow-hidden bg-card border border-border shadow-lg relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                  <div className="text-sm text-muted-foreground">Loading map...</div>
                </div>
              )}
              
              {selectedMap ? (
                <ComposableMap 
                  projection="geoMercator"
                  style={{ width: '100%', height: '100%' }}
                  projectionConfig={{
                    center: selectedMap.center || [0, 0],
                    scale: 147
                  }}
                >
                  <ZoomableGroup zoom={zoom} center={center} onMoveEnd={handleMoveEnd}>
                    <Geographies geography={selectedMap.url}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            style={{
                              default: {
                                fill: 'hsl(var(--primary))',
                                stroke: 'hsl(var(--border))',
                                strokeWidth: 0.5,
                                outline: 'none',
                              },
                              hover: {
                                fill: 'hsl(var(--primary))',
                                stroke: 'hsl(var(--border))',
                                strokeWidth: 0.5,
                                outline: 'none',
                              },
                            }}
                          />
                        ))
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                  <Globe className="w-24 h-24 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Select a map to preview</p>
                  <p className="text-sm mt-2 text-center max-w-md">
                    Choose from popular maps or search for specific regions, countries, states, or cities
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};