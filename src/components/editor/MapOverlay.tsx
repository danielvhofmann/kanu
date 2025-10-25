import { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapOverlayProps {
  nodes: Node[];
  onUpdateNode: (nodeId: string, coordinates: [number, number]) => void;
  onClose: () => void;
}

export const MapOverlay = ({ nodes, onUpdateNode, onClose }: MapOverlayProps) => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleMapClick = useCallback((event: any) => {
    if (!selectedNodeId) return;
    
    const coords = event.coordinates as [number, number];
    onUpdateNode(selectedNodeId, coords);
    setSelectedNodeId(null);
  }, [selectedNodeId, onUpdateNode]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
  const handleReset = () => {
    setZoom(1);
    setCenter([0, 0]);
  };

  const nodesWithCoords = nodes.filter(n => n.data.coordinates);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Geographic Layout Mode</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedNodeId 
                ? "Click on the map to place the selected node" 
                : "Select a node from the list to position it on the map"}
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        <div className="flex-1 flex">
          {/* Sidebar with node list */}
          <Card className="w-64 m-4 p-4 overflow-auto">
            <h3 className="font-semibold mb-3">Nodes</h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <Button
                  key={node.id}
                  variant={selectedNodeId === node.id ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: node.style?.background as string }}
                    />
                    <span className="truncate">{node.data.label}</span>
                    {node.data.coordinates && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </Card>

          {/* Map */}
          <div className="flex-1 m-4 rounded-lg overflow-hidden bg-card border border-border">
            <ComposableMap 
              projection="geoMercator"
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup zoom={zoom} center={center} onMoveEnd={setCenter}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={handleMapClick}
                        style={{
                          default: {
                            fill: 'hsl(var(--muted))',
                            stroke: 'hsl(var(--border))',
                            strokeWidth: 0.5,
                            outline: 'none',
                          },
                          hover: {
                            fill: 'hsl(var(--accent))',
                            stroke: 'hsl(var(--border))',
                            strokeWidth: 0.5,
                            outline: 'none',
                            cursor: selectedNodeId ? 'crosshair' : 'default',
                          },
                          pressed: {
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
                
                {/* Render markers for nodes with coordinates */}
                {nodesWithCoords.map((node) => (
                  <Marker 
                    key={node.id} 
                    coordinates={node.data.coordinates as [number, number]}
                  >
                    <g
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r={6 / zoom}
                        fill={node.style?.background as string || 'hsl(var(--primary))'}
                        stroke="white"
                        strokeWidth={2 / zoom}
                      />
                      <text
                        textAnchor="middle"
                        y={-12 / zoom}
                        style={{
                          fill: 'hsl(var(--foreground))',
                          fontSize: `${12 / zoom}px`,
                          fontWeight: 500,
                          pointerEvents: 'none',
                        }}
                      >
                        {node.data.label}
                      </text>
                    </g>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
          </div>
        </div>
      </div>
    </div>
  );
};