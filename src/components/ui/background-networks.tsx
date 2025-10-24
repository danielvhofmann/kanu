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
    // Create varied clusters with different sizes and hub counts
    const clusters = [
      { x: 20, y: 30, nodeCount: 8, isMainHub: true },  // Large left cluster
      { x: 50, y: 20, nodeCount: 5, isMainHub: false }, // Small top cluster
      { x: 70, y: 35, nodeCount: 6, isMainHub: true },  // Medium right cluster
      { x: 35, y: 60, nodeCount: 4, isMainHub: false }, // Small bottom-left
      { x: 65, y: 70, nodeCount: 7, isMainHub: true },  // Medium bottom-right
    ];
    
    const generatedNodes: Node[] = [];
    const hubNodes: Node[] = []; // Track hub nodes for cross-connections
    let nodeId = 0;
    
    clusters.forEach((cluster, clusterIndex) => {
      const { x: targetCenterX, y: targetCenterY, nodeCount, isMainHub } = cluster;
      
      // Swap diagonal positions for crossing movement
      const initialCenterX = 100 - targetCenterX + (Math.random() - 0.5) * 20;
      const initialCenterY = 100 - targetCenterY + (Math.random() - 0.5) * 20;
      
      // Create hub node(s)
      const hubCount = isMainHub ? 2 : 1; // Main hubs have 2 central nodes
      
      for (let h = 0; h < hubCount; h++) {
        const hubInitialX = initialCenterX + (Math.random() - 0.5) * 25;
        const hubInitialY = initialCenterY + (Math.random() - 0.5) * 25;
        
        const hubOffset = h * 5; // Slight offset for second hub
        const hubNode = {
          id: nodeId++,
          x: hubInitialX,
          y: hubInitialY,
          targetX: targetCenterX + hubOffset,
          targetY: targetCenterY + hubOffset,
          size: isMainHub ? 4 + Math.random() : 3 + Math.random(),
        };
        generatedNodes.push(hubNode);
        hubNodes.push(hubNode);
      }
      
      // Create spoke nodes with organic distribution
      const spokeCount = nodeCount - hubCount;
      for (let s = 0; s < spokeCount; s++) {
        // Create irregular angles and radii for organic look
        const angleVariation = (Math.random() - 0.5) * Math.PI / 3;
        const angle = (s / spokeCount) * Math.PI * 2 + angleVariation;
        
        // Vary radius significantly for depth
        const radiusVariation = Math.random() * 10;
        const baseRadius = isMainHub ? 15 : 10;
        const radius = baseRadius + radiusVariation + (s % 2) * 5;
        
        const spokeInitialX = initialCenterX + (Math.random() - 0.5) * 45;
        const spokeInitialY = initialCenterY + (Math.random() - 0.5) * 45;
        
        generatedNodes.push({
          id: nodeId++,
          x: spokeInitialX,
          y: spokeInitialY,
          targetX: targetCenterX + Math.cos(angle) * radius,
          targetY: targetCenterY + Math.sin(angle) * radius,
          size: 1.5 + Math.random() * 2,
        });
      }
    });

    // Generate edges with hub-spoke pattern + cross-cluster connections
    const generatedEdges: Edge[] = [];
    let currentNodeIndex = 0;
    
    clusters.forEach((cluster, clusterIndex) => {
      const { nodeCount, isMainHub } = cluster;
      const hubCount = isMainHub ? 2 : 1;
      
      // Get hub nodes for this cluster
      const clusterHubs = generatedNodes.slice(currentNodeIndex, currentNodeIndex + hubCount);
      const mainHub = clusterHubs[0];
      
      // Connect hubs within cluster if there are 2
      if (hubCount === 2) {
        generatedEdges.push({ from: clusterHubs[0], to: clusterHubs[1] });
      }
      
      // Connect spokes to hubs
      for (let s = hubCount; s < nodeCount; s++) {
        const spokeNode = generatedNodes[currentNodeIndex + s];
        const targetHub = clusterHubs[s % hubCount]; // Distribute connections
        generatedEdges.push({ from: targetHub, to: spokeNode });
        
        // Occasionally connect spokes to each other for web effect
        if (s > hubCount && Math.random() > 0.75) {
          const prevSpoke = generatedNodes[currentNodeIndex + s - 1];
          generatedEdges.push({ from: prevSpoke, to: spokeNode });
        }
        
        // Some spokes connect to multiple hubs
        if (hubCount === 2 && Math.random() > 0.7) {
          const otherHub = clusterHubs[(s + 1) % hubCount];
          generatedEdges.push({ from: otherHub, to: spokeNode });
        }
      }
      
      currentNodeIndex += nodeCount;
    });
    
    // Add cross-cluster connections between hubs
    hubNodes.forEach((hub, i) => {
      // Connect to 1-2 other hubs
      const connectionCount = Math.random() > 0.6 ? 2 : 1;
      for (let c = 0; c < connectionCount; c++) {
        const targetIndex = (i + 1 + c * 2) % hubNodes.length;
        if (targetIndex !== i && Math.random() > 0.3) {
          generatedEdges.push({ from: hub, to: hubNodes[targetIndex] });
        }
      }
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
            r={node.size / 8}
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
