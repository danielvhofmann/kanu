import { useEffect, useRef, useCallback, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import * as d3 from "d3-force";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timeline } from "./Timeline";

interface Node {
  id: string;
  name: string;
  category: string;
  profession: string;
  val: number;
  color?: string;
  bio?: string;
  birth?: string;
  death?: string;
  imageUrl?: string;
  wikipediaUrl?: string;
  importanceScore?: number;
  x?: number;
  y?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  relationship: string;
  type?: string;
  year?: number;
  startYear?: number;
  endYear?: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

const categoryColors: Record<string, string> = {
  Science: "hsl(220, 70%, 50%)",
  Art: "hsl(280, 65%, 60%)",
  Philosophy: "hsl(30, 80%, 55%)",
  Politics: "hsl(0, 70%, 55%)",
  Music: "hsl(142, 76%, 36%)",
  Polymath: "hsl(45, 93%, 47%)",
  Other: "hsl(240, 10%, 50%)",
};

export const KnowledgeGraph = ({ 
  personId, 
  personName,
  onBack 
}: { 
  personId: string; 
  personName: string;
  onBack: () => void;
}) => {
  const graphRef = useRef<any>();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<Link | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [bioSummary, setBioSummary] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  useEffect(() => {
    loadNetwork();
  }, [personId]);

  const loadNetwork = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-person-network', {
        body: { personId }
      });

      if (error) throw error;

      // Add colors and scale node sizes
      const nodesWithColors = data.nodes.map((node: Node) => ({
        ...node,
        color: categoryColors[node.category] || categoryColors.Other,
        val: 15 + (node.importanceScore || 0) / 70
      }));

      setGraphData({ nodes: nodesWithColors, links: data.links });
      
      // Auto-select main person
      const mainNode = nodesWithColors.find((n: Node) => n.id === personId);
      if (mainNode) {
        setTimeout(() => {
          setSelectedNode(mainNode);
          generateBioSummary(mainNode);
          if (graphRef.current) {
            graphRef.current.centerAt(0, 0, 1000);
            graphRef.current.zoom(2, 1000);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error loading network:', error);
      toast.error('Failed to load network. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBioSummary = async (node: Node) => {
    if (!node.bio) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-bio-summary', {
        body: {
          name: node.name,
          domain: node.profession,
          bio: node.bio,
          birth: node.birth,
          death: node.death
        }
      });

      if (error) throw error;
      setBioSummary(data.summary);
    } catch (error) {
      console.error('Error generating bio:', error);
    }
  };

  const explainConnection = async (person1: string, person2: string) => {
    setIsLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('explain-connection', {
        body: {
          person1,
          person2,
          nodes: graphData.nodes,
          links: graphData.links
        }
      });

      if (error) throw error;
      setExplanation(data.explanation);
    } catch (error) {
      console.error('Error explaining connection:', error);
      toast.error('Failed to generate explanation.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);
    setSelectedLink(null);
    setSelectedTimelineEvent(null);
    setExplanation("");
    setBioSummary("");
    generateBioSummary(node);
    
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(3, 1000);
    }
  }, []);

  const handleLinkClick = useCallback((link: Link) => {
    setSelectedLink(link);
    setSelectedNode(null);
    setSelectedTimelineEvent(null);
    
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    const sourceName = graphData.nodes.find(n => n.id === sourceId)?.name || sourceId;
    const targetName = graphData.nodes.find(n => n.id === targetId)?.name || targetId;
    
    explainConnection(sourceName, targetName);
  }, [graphData.nodes]);

  const handleTimelineEventClick = (event: Link) => {
    setSelectedTimelineEvent(event);
    setSelectedLink(event);
    setSelectedNode(null);
    
    const sourceId = typeof event.source === 'string' ? event.source : event.source.id;
    const targetId = typeof event.target === 'string' ? event.target : event.target.id;
    
    const sourceName = graphData.nodes.find(n => n.id === sourceId)?.name || sourceId;
    const targetName = graphData.nodes.find(n => n.id === targetId)?.name || targetId;
    
    explainConnection(sourceName, targetName);
  };

  useEffect(() => {
    if (graphRef.current) {
      const fg = graphRef.current;
      
      // Configure forces
      fg.d3Force('charge').strength(-300);
      fg.d3Force('link').distance(80);
      
      // Add bounding force
      fg.d3Force('bounds', () => {
        const bounds = { left: -350, right: 350, top: -300, bottom: 300 };
        graphData.nodes.forEach((node: any) => {
          if (node.x < bounds.left) node.x = bounds.left;
          if (node.x > bounds.right) node.x = bounds.right;
          if (node.y < bounds.top) node.y = bounds.top;
          if (node.y > bounds.bottom) node.y = bounds.bottom;
        });
      });
    }
  }, [graphData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Building knowledge network...</p>
        </div>
      </div>
    );
  }

  const timelineEvents = graphData.links.filter(l => l.year || (l.startYear && l.endYear));

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-light">Knowledge Network</h1>
            <p className="text-sm text-muted-foreground">Exploring connections for {personName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph */}
        <div className="flex-1 relative">
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeLabel="name"
            nodeColor="color"
            nodeVal="val"
            linkColor={(link) => {
              if (selectedTimelineEvent === link) {
                const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                const sourceNode = graphData.nodes.find(n => n.id === sourceId);
                return sourceNode?.color || '#999';
              }
              return selectedTimelineEvent ? 'rgba(153, 153, 153, 0.15)' : 'rgba(153, 153, 153, 0.3)';
            }}
            linkWidth={(link) => selectedTimelineEvent === link ? 4 : 2}
            linkDirectionalParticles={(link) => selectedTimelineEvent === link ? 6 : 0}
            linkDirectionalParticleWidth={3}
            onNodeClick={handleNodeClick}
            onLinkClick={handleLinkClick}
            d3VelocityDecay={0.4}
            minZoom={1.5}
            maxZoom={3}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.font = `${fontSize}px Sans-Serif`;
              
              // Draw node
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
              ctx.fillStyle = node.color;
              ctx.shadowBlur = 15;
              ctx.shadowColor = node.color;
              ctx.fill();
              ctx.shadowBlur = 0;
              
              // Draw label
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = 'hsl(var(--foreground))';
              ctx.fillText(label, node.x, node.y + node.val + 2);
            }}
          />
        </div>

        {/* Info Panel */}
        {(selectedNode || selectedLink) && (
          <div className="w-96 border-l border-border bg-card overflow-y-auto">
            <div className="p-6">
              {selectedNode && (
                <>
                  {selectedNode.imageUrl && (
                    <img 
                      src={selectedNode.imageUrl} 
                      alt={selectedNode.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h2 className="text-2xl font-light mb-2">{selectedNode.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedNode.profession} • {selectedNode.category}
                  </p>
                  {(selectedNode.birth || selectedNode.death) && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedNode.birth || '?'} - {selectedNode.death || 'present'}
                    </p>
                  )}
                  {bioSummary && (
                    <p className="text-sm mb-4">{bioSummary}</p>
                  )}
                  {selectedNode.wikipediaUrl && (
                    <a 
                      href={selectedNode.wikipediaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Read more on Wikipedia →
                    </a>
                  )}
                </>
              )}

              {selectedLink && (
                <>
                  <h3 className="text-lg font-medium mb-4">Connection</h3>
                  {isLoadingExplanation ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Generating explanation...</span>
                    </div>
                  ) : explanation ? (
                    <p className="text-sm leading-relaxed">{explanation}</p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <div className="border-t border-border bg-card">
          <Timeline 
            events={timelineEvents} 
            nodes={graphData.nodes}
            onEventClick={handleTimelineEventClick}
            selectedEvent={selectedTimelineEvent}
          />
        </div>
      )}
    </div>
  );
};
