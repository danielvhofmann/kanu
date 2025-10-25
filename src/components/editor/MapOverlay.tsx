import { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const mapSources = {
  world: {
    url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    name: "World Map"
  },
  worldDetailed: {
    url: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
    name: "World (Detailed)"
  },
  usStates: {
    url: "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
    name: "USA States"
  }
};

interface MapOverlayProps {
  onSelectBackground: (mapData: any) => void;
  onClose: () => void;
}

export const MapOverlay = ({ onSelectBackground, onClose }: MapOverlayProps) => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mapSource, setMapSource] = useState<keyof typeof mapSources>('world');

  const handleRegionClick = useCallback((geo: any) => {
    setSelectedRegion(geo);
    const regionName = geo.properties.name || geo.properties.NAME || 'Selected Region';
    toast.success(`Selected: ${regionName}`);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => {
    setZoom(1);
    setCenter([0, 0]);
    setSelectedRegion(null);
  };

  const handleUseAsBackground = useCallback(() => {
    if (selectedRegion) {
      onSelectBackground({
        geography: selectedRegion,
        mapSource: mapSources[mapSource].url,
        zoom,
        center,
      });
      const regionName = selectedRegion.properties.name || selectedRegion.properties.NAME || 'Region';
      toast.success(`Applied ${regionName} as network background`);
      onClose();
    }
  }, [selectedRegion, mapSource, zoom, center, onSelectBackground, onClose]);

  const getRegionName = (geo: any) => {
    return geo.properties.name || geo.properties.NAME || geo.properties.NAME_LONG || 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-lg">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Select Geographic Region</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedRegion 
                ? `Selected: ${getRegionName(selectedRegion)}` 
                : "Click on a region to select it as your network background"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={mapSource} onValueChange={(value) => setMapSource(value as keyof typeof mapSources)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(mapSources).map(([key, source]) => (
                  <SelectItem key={key} value={key}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-border" />
            <Button 
              variant="default" 
              size="sm"
              onClick={handleUseAsBackground}
              disabled={!selectedRegion}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Use as Background
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex p-4">
          {/* Map - Full Width */}
          <div className="flex-1 rounded-lg overflow-hidden bg-card border border-border shadow-lg">
            <ComposableMap 
              projection="geoMercator"
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup zoom={zoom} center={center} onMoveEnd={setCenter}>
                <Geographies geography={mapSources[mapSource].url}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const isSelected = selectedRegion?.rsmKey === geo.rsmKey;
                      const isHovered = hoveredRegion === geo.rsmKey;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleRegionClick(geo)}
                          onMouseEnter={() => setHoveredRegion(geo.rsmKey)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          style={{
                            default: {
                              fill: isSelected 
                                ? 'hsl(var(--primary))' 
                                : 'hsl(var(--muted))',
                              stroke: 'hsl(var(--border))',
                              strokeWidth: isSelected ? 1.5 : 0.5,
                              outline: 'none',
                              transition: 'all 0.2s',
                            },
                            hover: {
                              fill: isSelected 
                                ? 'hsl(var(--primary))' 
                                : 'hsl(var(--accent))',
                              stroke: 'hsl(var(--primary))',
                              strokeWidth: 1,
                              outline: 'none',
                              cursor: 'pointer',
                            },
                            pressed: {
                              fill: 'hsl(var(--primary))',
                              stroke: 'hsl(var(--primary))',
                              strokeWidth: 1.5,
                              outline: 'none',
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>
      </div>
    </div>
  );
};