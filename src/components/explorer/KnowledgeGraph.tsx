import { useEffect, useRef, useCallback, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import * as d3 from "d3-force";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { Timeline } from "./Timeline";
import { ExplorerHeader } from "./ExplorerHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { convertExplorerToBuilder } from "@/utils/graphConverter";

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
  personId: initialPersonId, 
  personName: initialPersonName,
  onBack,
  onPersonChange
}: { 
  personId: string; 
  personName: string;
  onBack: () => void;
  onPersonChange?: (personId: string, personName: string) => void;
}) => {
  const navigate = useNavigate();
  const [personId, setPersonId] = useState(initialPersonId);
  const [personName, setPersonName] = useState(initialPersonName);
  const graphRef = useRef<any>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<Link | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [bioSummary, setBioSummary] = useState<string>("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isConnectedBioExpanded, setIsConnectedBioExpanded] = useState(false);

  const handlePersonChange = (newPersonId: string, newPersonName: string) => {
    setPersonId(newPersonId);
    setPersonName(newPersonName);
    if (onPersonChange) {
      onPersonChange(newPersonId, newPersonName);
    }
  };

  const handleImportToBuilder = () => {
    try {
      const { nodes, edges } = convertExplorerToBuilder({
        nodes: graphData.nodes,
        links: graphData.links,
      });

      navigate('/editor', {
        state: {
          importedFrom: 'explorer',
          sourcePersonName: personName,
          nodes,
          edges,
        },
      });

      toast.success('Network imported to Builder Mode');
    } catch (error) {
      console.error('Failed to import to builder:', error);
      toast.error('Failed to import network');
    }
  };

  // Track canvas dimensions with ResizeObserver
  useEffect(() => {
    if (!canvasRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasDimensions({ width, height });
      }
    });

    resizeObserver.observe(canvasRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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
      const nodesWithColors = data.nodes.map((node: Node) => {
        const baseSize = 8 + (node.importanceScore || 0) / 100;
        // Make the main person 1.8x larger
        const mainPersonSize = node.id === personId ? baseSize * 1.8 : baseSize;
        
        // Ensure no other node is bigger than the main person
        // Find the main person's size first
        const mainNode = data.nodes.find((n: Node) => n.id === personId);
        const mainNodeBaseSize = mainNode ? 8 + (mainNode.importanceScore || 0) / 100 : baseSize;
        const maxOtherNodeSize = mainNodeBaseSize * 1.8;
        
        const size = node.id === personId ? mainPersonSize : Math.min(baseSize, maxOtherNodeSize * 0.9);
        
        return {
          ...node,
          color: categoryColors[node.category] || categoryColors.Other,
          val: size
        };
      });

      setGraphData({ nodes: nodesWithColors, links: data.links });
      
      // Auto-select main person and generate bio
      const mainNode = nodesWithColors.find((n: Node) => n.id === personId);
      if (mainNode) {
        // Set selected node immediately
        setSelectedNode(mainNode);
        generateBioSummary(mainNode);
        
        // Center graph after a short delay with calculated zoom
        setTimeout(() => {
          if (graphRef.current && canvasDimensions.width > 0) {
            // Calculate optimal zoom based on network spread and canvas size
            const networkBounds = {
              minX: Math.min(...nodesWithColors.map((n: Node) => n.x || 0)),
              maxX: Math.max(...nodesWithColors.map((n: Node) => n.x || 0)),
              minY: Math.min(...nodesWithColors.map((n: Node) => n.y || 0)),
              maxY: Math.max(...nodesWithColors.map((n: Node) => n.y || 0))
            };

            const networkWidth = Math.max(networkBounds.maxX - networkBounds.minX, 100);
            const networkHeight = Math.max(networkBounds.maxY - networkBounds.minY, 100);

            const margin = 0.2; // 20% margin
            const optimalZoomX = (canvasDimensions.width * (1 - margin)) / networkWidth;
            const optimalZoomY = (canvasDimensions.height * (1 - margin)) / networkHeight;
            const optimalZoom = Math.min(optimalZoomX, optimalZoomY, 3); // maxZoom = 3
            const finalZoom = Math.max(optimalZoom, 1.5); // minZoom = 1.5

            graphRef.current.centerAt(0, 0, 1000);
            graphRef.current.zoom(finalZoom, 1000);
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
    setIsConnectedBioExpanded(false);
    
    // If this is NOT the main person, generate connection explanation
    if (node.id !== personId) {
      const mainPersonNode = graphData.nodes.find(n => n.id === personId);
      if (mainPersonNode) {
        explainConnection(mainPersonNode.name, node.name);
      }
      // Also generate their bio
      generateBioSummary(node);
    } else {
      // If it IS the main person, just generate their bio
      generateBioSummary(node);
    }
    
    // DO NOT zoom - just center gently without zoom
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500);
    }
  }, [graphData.nodes, personId]);

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

  // Configure forces based on canvas dimensions
  useEffect(() => {
    if (graphRef.current && canvasDimensions.width > 0) {
      const fg = graphRef.current;
      
      // Calculate dynamic scaling based on canvas area
      const referenceArea = 1920 * 1080; // Reference screen
      const canvasArea = canvasDimensions.width * canvasDimensions.height;
      const areaScale = Math.sqrt(canvasArea / referenceArea);
      
      // Scale forces based on canvas size
      const chargeStrength = -500 * areaScale;
      const linkDistance = 120 * areaScale;
      
      fg.d3Force('charge').strength(chargeStrength);
      fg.d3Force('link').distance(linkDistance);
      
      // Add collision force to prevent overlaps (nodes + label space)
      fg.d3Force('collide', d3.forceCollide()
        .radius((node: any) => {
          const labelHeight = 20;
          return node.val + labelHeight;
        })
        .strength(0.8)
        .iterations(2)
      );
      
      // Calculate dynamic bounds (70% of canvas, centered at origin)
      const boundsWidth = canvasDimensions.width * 0.35;
      const boundsHeight = canvasDimensions.height * 0.35;
      
      fg.d3Force('bounds', () => {
        const bounds = { 
          left: -boundsWidth, 
          right: boundsWidth, 
          top: -boundsHeight, 
          bottom: boundsHeight 
        };
        graphData.nodes.forEach((node: any) => {
          if (node.x < bounds.left) node.x = bounds.left;
          if (node.x > bounds.right) node.x = bounds.right;
          if (node.y < bounds.top) node.y = bounds.top;
          if (node.y > bounds.bottom) node.y = bounds.bottom;
        });
      });
    }
  }, [graphData, canvasDimensions]);

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

  // Get all connections for selected node
  const getNodeConnections = (nodeId: string) => {
    return graphData.links
      .filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        return sourceId === nodeId || targetId === nodeId;
      })
      .map(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        const connectedId = sourceId === nodeId ? targetId : sourceId;
        const connectedNode = graphData.nodes.find(n => n.id === connectedId);
        return {
          node: connectedNode,
          relationship: link.relationship
        };
      });
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <ExplorerHeader 
        currentPersonName={personName}
        onSearch={handlePersonChange}
        onBack={onBack}
        onImportToBuilder={handleImportToBuilder}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative h-full">
        {/* Graph - Use calc to leave room for right panel */}
        <div ref={canvasRef} className="flex-1 relative bg-card overflow-hidden h-full">
          {/* Timeline Button - Positioned absolutely at bottom */}
          {timelineEvents.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg"
                  variant="default"
                  size="lg"
                >
                  Open Timeline ({timelineEvents.length} events)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Timeline</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  <Timeline 
                    events={timelineEvents} 
                    nodes={graphData.nodes}
                    onEventClick={handleTimelineEventClick}
                    selectedEvent={selectedTimelineEvent}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <ForceGraph2D
            ref={graphRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
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
              
              // Highlight selected node with a ring
              if (selectedNode && node.id === selectedNode.id) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val + 3, 0, 2 * Math.PI);
                ctx.strokeStyle = node.color;
                ctx.lineWidth = 2;
                ctx.stroke();
              }
              
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
              ctx.fillText(label, node.x, node.y + node.val + 4);
            }}
          />
        </div>

        {/* Info Panel - Always visible with fixed width */}
        <div className="w-96 max-w-[384px] h-full flex-shrink-0 border-l border-border bg-card overflow-y-auto z-10">
          <div className="p-6 space-y-6">
            {selectedNode ? (
              <>
                {/* Portrait */}
                {selectedNode.imageUrl && (
                  <img 
                    src={selectedNode.imageUrl} 
                    alt={selectedNode.name}
                    className="w-48 h-48 object-cover rounded-2xl mx-auto"
                  />
                )}
                
                {/* Name & Basic Info */}
                <div>
                  <h2 className="text-3xl font-light mb-1">{selectedNode.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedNode.profession}
                  </p>
                  {(selectedNode.birth || selectedNode.death) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedNode.birth || '?'} - {selectedNode.death || 'present'}
                    </p>
                  )}
                </div>

                {/* Check if this is the main person or a connected person */}
                {selectedNode.id === personId ? (
                  <>
                    {/* Main Person View - Biography */}
                    {bioSummary && (
                      <div>
                        <p className="text-base leading-relaxed">{bioSummary}</p>
                        <p className="text-xs text-muted-foreground mt-2">Source: Wikipedia</p>
                      </div>
                    )}

                    {/* External Links */}
                    <div className="flex gap-3">
                      {selectedNode.wikipediaUrl && (
                        <a 
                          href={selectedNode.wikipediaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Read on Wikipedia
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a 
                        href={`https://www.wikidata.org/wiki/${selectedNode.id}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View on Wikidata
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* All Connections */}
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-t text-sm hover:bg-accent/50 transition-colors rounded-lg px-2">
                        <span className="font-medium flex items-center gap-2">
                          All Connections
                          <span className="text-xs font-normal text-muted-foreground">
                            ({getNodeConnections(selectedNode.id).length})
                          </span>
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                          {getNodeConnections(selectedNode.id).map(({ node, relationship }, index) => {
                            if (!node) return null;
                            return (
                              <button
                                key={index}
                                onClick={() => handleNodeClick(node)}
                                className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                              >
                                <div 
                                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ backgroundColor: node.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{node.name}</p>
                                  <p className="text-xs text-muted-foreground">{relationship}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                ) : (
                  <>
                    {/* Connected Person View - Connection Explanation */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold mb-3">
                          How are {personName} and {selectedNode.name} connected?
                        </h3>
                        {isLoadingExplanation ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generating explanation...</span>
                          </div>
                        ) : explanation ? (
                          <>
                            <p className="text-base leading-relaxed">{explanation}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Generated by AI from knowledge graph analysis
                            </p>
                          </>
                        ) : null}
                      </div>

                      {/* Collapsible Biography */}
                      <Collapsible open={isConnectedBioExpanded} onOpenChange={setIsConnectedBioExpanded}>
                        <CollapsibleTrigger className="flex items-center gap-2 w-full py-3 border-t text-sm hover:bg-accent/50 transition-colors rounded-lg px-2">
                          {isConnectedBioExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <span className="font-medium">Who was {selectedNode.name}?</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pt-3 pb-2 space-y-3">
                            {bioSummary ? (
                              <>
                                <p className="text-sm leading-relaxed">{bioSummary}</p>
                                <p className="text-xs text-muted-foreground">Source: Wikipedia</p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">Loading biography...</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* External Links */}
                      <div className="flex gap-3 pt-2">
                        {selectedNode.wikipediaUrl && (
                          <a 
                            href={selectedNode.wikipediaUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Read on Wikipedia
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <a 
                          href={`https://www.wikidata.org/wiki/${selectedNode.id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          View on Wikidata
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* Sources Section */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-t text-sm hover:bg-accent/50 transition-colors rounded-lg px-2">
                    <span className="font-medium">Sources</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-3 pb-2 text-xs text-muted-foreground space-y-2 px-2">
                      <p>Data provided by Wikidata, the free knowledge base</p>
                      <p>Biographical information from Wikipedia</p>
                      <p>AI-generated summaries powered by Lovable AI</p>
                      <div className="pt-2 space-y-1">
                        <a 
                          href={`https://www.wikidata.org/wiki/${selectedNode.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-primary hover:underline"
                        >
                          Wikidata entry
                        </a>
                        {selectedNode.wikipediaUrl && (
                          <a 
                            href={selectedNode.wikipediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-primary hover:underline"
                          >
                            Wikipedia article
                          </a>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            ) : selectedLink ? (
              <>
                <h3 className="text-lg font-semibold">Connection</h3>
                {isLoadingExplanation ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating explanation...</span>
                  </div>
                ) : explanation ? (
                  <p className="text-sm leading-relaxed">{explanation}</p>
                ) : null}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Click any node to explore connections</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
