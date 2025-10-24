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
    // Cluster centers positioned away from middle
    const clusterCenters = [
      { x: 25, y: 25, nodeCount: 5 }, // top-left: 1 hub + 4 spokes
      { x: 75, y: 25, nodeCount: 4 }, // top-right: 1 hub + 3 spokes
      { x: 25, y: 75, nodeCount: 6 }, // bottom-left: 1 hub + 5 spokes
      { x: 75, y: 75, nodeCount: 5 }  // bottom-right: 1 hub + 4 spokes
    ];
    
    const generatedNodes: Node[] = [];
    let nodeId = 0;
    
    for (let c = 0; c < clusterCenters.length; c++) {
      const cluster = clusterCenters[c];
      const { x: targetCenterX, y: targetCenterY, nodeCount } = cluster;
      
      // Calculate initial center (swap diagonal positions)
      // Top-left target -> bottom-right initial, etc.
      const initialCenterX = 100 - targetCenterX;
      const initialCenterY = 100 - targetCenterY;
      
      // Create hub node
      const hubInitialX = initialCenterX + (Math.random() - 0.5) * 30;
      const hubInitialY = initialCenterY + (Math.random() - 0.5) * 30;
      
      const hubNode = {
        id: nodeId++,
        x: hubInitialX,
        y: hubInitialY,
        targetX: targetCenterX,
        targetY: targetCenterY,
        size: 3 + Math.random() * 2,
      };
      generatedNodes.push(hubNode);
      
      // Create spoke nodes with varied arrangements
      for (let s = 1; s < nodeCount; s++) {
        // Vary the angle distribution per cluster
        const angleOffset = c * 0.5; // Different starting angles
        const angle = angleOffset + (s / (nodeCount - 1)) * Math.PI * 2;
        
        // Vary radius per cluster
        const baseRadius = 10 + c * 2;
        const radius = baseRadius + Math.random() * 8;
        
        const spokeInitialX = initialCenterX + (Math.random() - 0.5) * 40;
        const spokeInitialY = initialCenterY + (Math.random() - 0.5) * 40;
        
        generatedNodes.push({
          id: nodeId++,
          x: spokeInitialX,
          y: spokeInitialY,
          targetX: targetCenterX + Math.cos(angle) * radius,
          targetY: targetCenterY + Math.sin(angle) * radius,
          size: 2 + Math.random() * 2,
        });
      }
    }

    // Generate edges with hub-and-spoke + some inter-cluster connections
    const generatedEdges: Edge[] = [];
    let currentNodeIndex = 0;
    
    for (let c = 0; c < clusterCenters.length; c++) {
      const cluster = clusterCenters[c];
      const hubNode = generatedNodes[currentNodeIndex];
      
      // Connect spokes to hub (with some randomness)
      for (let s = 1; s < cluster.nodeCount; s++) {
        const spokeNode = generatedNodes[currentNodeIndex + s];
        generatedEdges.push({ from: hubNode, to: spokeNode });
        
        // Sometimes connect spokes to each other for variety
        if (s > 1 && Math.random() > 0.7) {
          const prevSpoke = generatedNodes[currentNodeIndex + s - 1];
          generatedEdges.push({ from: prevSpoke, to: spokeNode });
        }
      }
      
      // Add inter-cluster connections
      if (c < clusterCenters.length - 1 && Math.random() > 0.8) {
        const nextClusterStart = currentNodeIndex + cluster.nodeCount;
        const nextHubNode = generatedNodes[nextClusterStart];
        generatedEdges.push({ from: hubNode, to: nextHubNode });
      }
      
      currentNodeIndex += cluster.nodeCount;
    }

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
