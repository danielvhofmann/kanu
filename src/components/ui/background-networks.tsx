"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
}

interface Edge {
  from: Node;
  to: Node;
}

function FloatingNetwork({ layer }: { layer: number }) {
  const { nodes, edges } = useMemo(() => {
    // Offset clusters significantly based on layer to avoid overlap
    const layerOffsetX = (layer - 1) * 15;
    const layerOffsetY = (layer - 1) * 5;
    
    // Create fewer, well-spaced clusters for a cleaner look
    const clusters = [
      { x: 20 + layerOffsetX, y: 40 + layerOffsetY, nodeCount: 6, hubRadius: 8 },   // Left cluster
      { x: 50 + layerOffsetX, y: 30 + layerOffsetY, nodeCount: 8, hubRadius: 9 },   // Center-top (main)
      { x: 75 + layerOffsetX, y: 45 + layerOffsetY, nodeCount: 7, hubRadius: 8.5 }, // Right cluster
      { x: 45 + layerOffsetX, y: 65 + layerOffsetY, nodeCount: 5, hubRadius: 7 },   // Bottom cluster
    ];
    
    const generatedNodes: Node[] = [];
    const hubNodes: Node[] = [];
    let nodeId = 0;
    
    clusters.forEach((cluster) => {
      const { x: targetCenterX, y: targetCenterY, nodeCount, hubRadius } = cluster;
      
      // Initial positions - completely random and chaotic across the whole canvas
      const chaosSpread = 150;
      
      // Create 1 hub node per cluster for simplicity
      const hubCount = 1;
      
      for (let h = 0; h < hubCount; h++) {
        const hubInitialX = Math.random() * chaosSpread - 25;
        const hubInitialY = Math.random() * chaosSpread - 25;
        
        const hubOffset = h * 3; // Small offset for second hub
        const hubNode = {
          id: nodeId++,
          x: hubInitialX,
          y: hubInitialY,
          targetX: targetCenterX + hubOffset,
          targetY: targetCenterY + hubOffset,
          size: 5 + Math.random() * 2, // Bigger hubs
        };
        generatedNodes.push(hubNode);
        hubNodes.push(hubNode);
      }
      
      // Create spoke nodes around the hub
      const spokeCount = nodeCount - hubCount;
      for (let s = 0; s < spokeCount; s++) {
        // Chaotic initial position
        const spokeInitialX = Math.random() * chaosSpread - 25;
        const spokeInitialY = Math.random() * chaosSpread - 25;
        
        // Organized target position with more spread
        const angle = (s / spokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const radiusVariation = Math.random() * 3;
        const radius = hubRadius + radiusVariation;
        
        generatedNodes.push({
          id: nodeId++,
          x: spokeInitialX,
          y: spokeInitialY,
          targetX: targetCenterX + Math.cos(angle) * radius,
          targetY: targetCenterY + Math.sin(angle) * radius,
          size: 2.5 + Math.random() * 2, // Bigger spokes
        });
      }
    });

    // Generate edges with short connections only
    const generatedEdges: Edge[] = [];
    let currentNodeIndex = 0;
    
    clusters.forEach((cluster) => {
      const { nodeCount } = cluster;
      const hubCount = 1;
      
      const clusterHubs = generatedNodes.slice(currentNodeIndex, currentNodeIndex + hubCount);
      const mainHub = clusterHubs[0];
      
      // Connect spokes to hub
      for (let s = hubCount; s < nodeCount; s++) {
        const spokeNode = generatedNodes[currentNodeIndex + s];
        generatedEdges.push({ from: mainHub, to: spokeNode });
        
        // Fewer spoke-to-spoke connections for cleaner look
        if (s > hubCount + 1 && Math.random() > 0.85) {
          const prevSpoke = generatedNodes[currentNodeIndex + s - 1];
          generatedEdges.push({ from: prevSpoke, to: spokeNode });
        }
      }
      
      currentNodeIndex += nodeCount;
    });
    
    // Selective hub-to-hub connections for connected but not cluttered network
    hubNodes.forEach((hub, i) => {
      // Each hub connects to 1-2 other hubs maximum
      if (i < hubNodes.length - 1) {
        generatedEdges.push({ from: hub, to: hubNodes[i + 1] });
      }
      // Occasionally add one more connection
      if (i < hubNodes.length - 2 && Math.random() > 0.7) {
        generatedEdges.push({ from: hub, to: hubNodes[i + 2] });
      }
    });
    
    // Add very few inter-cluster spoke connections for variety
    currentNodeIndex = 0;
    clusters.forEach((cluster, clusterIdx) => {
      const { nodeCount } = cluster;
      const hubCount = 1;
      
      if (clusterIdx < clusters.length - 1 && Math.random() > 0.7) {
        const spokeNode = generatedNodes[currentNodeIndex + hubCount + 1];
        const nextClusterStart = currentNodeIndex + nodeCount;
        const nextHubCount = 1;
        const nextSpokeNode = generatedNodes[nextClusterStart + nextHubCount];
        
        if (spokeNode && nextSpokeNode) {
          generatedEdges.push({ from: spokeNode, to: nextSpokeNode });
        }
      }
      
      currentNodeIndex += nodeCount;
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [layer]);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-50">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <title>Network Background Layer {layer}</title>
        
        {/* Render edges */}
        {edges.map((edge, i) => (
          <motion.line
            key={`edge-${layer}-${i}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="currentColor"
            strokeWidth={0.2}
            strokeOpacity={0.5}
            animate={{
              x1: [edge.from.x, edge.from.targetX, edge.from.targetX, edge.from.targetX, edge.from.x],
              y1: [edge.from.y, edge.from.targetY, edge.from.targetY, edge.from.targetY, edge.from.y],
              x2: [edge.to.x, edge.to.targetX, edge.to.targetX, edge.to.targetX, edge.to.x],
              y2: [edge.to.y, edge.to.targetY, edge.to.targetY, edge.to.targetY, edge.to.y],
            }}
            transition={{
              duration: 30,
              times: [0, 0.3, 0.5, 0.7, 1],
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        ))}

        {/* Render nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={`node-${layer}-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.size / 6} // Bigger nodes (divided by 6 instead of 8)
            fill="currentColor"
            fillOpacity={0.7}
            animate={{
              cx: [node.x, node.targetX, node.targetX, node.targetX, node.x],
              cy: [node.y, node.targetY, node.targetY, node.targetY, node.y],
            }}
            transition={{
              duration: 30,
              times: [0, 0.3, 0.5, 0.7, 1],
              ease: "easeInOut",
              repeat: Infinity,
              delay: node.id * 0.05,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundNetworks() {
  return (
    <>
      <div className="absolute inset-0 text-primary/40">
        <FloatingNetwork layer={1} />
      </div>
      <div className="absolute inset-0 text-secondary/40">
        <FloatingNetwork layer={2} />
      </div>
      <div className="absolute inset-0 text-accent/30">
        <FloatingNetwork layer={3} />
      </div>
    </>
  );
}
