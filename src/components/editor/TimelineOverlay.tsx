import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { NetworkCanvas } from './NetworkCanvas';

interface TimelineOverlayProps {
  nodes: Node[];
  edges: Edge[];
  onClose: () => void;
}

export const TimelineOverlay = ({ nodes, edges, onClose }: TimelineOverlayProps) => {
  const [currentYear, setCurrentYear] = useState(2024);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per year
  
  // Extract years from node data (if they have year property)
  const years = nodes
    .filter(n => n.data.year)
    .map(n => n.data.year)
    .sort((a, b) => a - b);
  
  const minYear = years.length > 0 ? Math.min(...years) : 1900;
  const maxYear = years.length > 0 ? Math.max(...years) : 2024;

  // Filter nodes and edges based on current year
  const getFilteredData = useCallback(() => {
    const filteredNodes = nodes.filter(node => {
      if (!node.data.year) return true; // Show nodes without year
      return node.data.year <= currentYear;
    });
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    return { filteredNodes, filteredEdges };
  }, [nodes, edges, currentYear]);

  const { filteredNodes, filteredEdges } = getFilteredData();

  const handlePrevYear = () => setCurrentYear(prev => Math.max(minYear, prev - 1));
  const handleNextYear = () => setCurrentYear(prev => Math.min(maxYear, prev + 1));
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-advance timeline when playing
  useState(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentYear(prev => {
        if (prev >= maxYear) {
          setIsPlaying(false);
          return maxYear;
        }
        return prev + 1;
      });
    }, playbackSpeed);
    
    return () => clearInterval(interval);
  });

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Timeline Mode</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize network evolution over time
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Timeline Controls */}
        <Card className="m-4 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevYear}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant={isPlaying ? "default" : "outline"}
                  size="icon" 
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextYear}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">{currentYear}</div>
                <div className="text-xs text-muted-foreground">
                  {filteredNodes.length} of {nodes.length} nodes visible
                </div>
              </div>
              
              <div className="w-32">
                <label className="text-xs text-muted-foreground">Speed</label>
                <Slider
                  value={[playbackSpeed]}
                  onValueChange={([value]) => setPlaybackSpeed(value)}
                  min={100}
                  max={2000}
                  step={100}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div>
              <Slider
                value={[currentYear]}
                onValueChange={([value]) => setCurrentYear(value)}
                min={minYear}
                max={maxYear}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{minYear}</span>
                <span>{maxYear}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Network Canvas */}
        <div className="flex-1 m-4 rounded-lg overflow-hidden bg-card border border-border">
          <NetworkCanvas
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeClick={() => {}}
            onEdgeClick={() => {}}
            onNodesChange={() => {}}
            onEdgesChange={() => {}}
            selectedNodeId={null}
            selectedEdgeId={null}
            isSketchMode={false}
            backgroundColor="hsl(0, 0%, 99%)"
          />
        </div>
      </div>
    </div>
  );
};