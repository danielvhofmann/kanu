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
    
    // Create one large interconnected network with fewer, larger clusters
    const clusters = [
      { x: 30 + layerOffsetX, y: 35 + layerOffsetY, nodeCount: 12, hubRadius: 7 },  // Large left cluster
      { x: 55 + layerOffsetX, y: 30 + layerOffsetY, nodeCount: 10, hubRadius: 6.5 }, // Large center-top
      { x: 70 + layerOffsetX, y: 50 + layerOffsetY, nodeCount: 11, hubRadius: 6.5 }, // Large right cluster
      { x: 45 + layerOffsetX, y: 60 + layerOffsetY, nodeCount: 9, hubRadius: 6 },    // Medium center-bottom
    ];
    
    const generatedNodes: Node[] = [];
    const hubNodes: Node[] = [];
    let nodeId = 0;
    
    clusters.forEach((cluster) => {
      const { x: targetCenterX, y: targetCenterY, nodeCount, hubRadius } = cluster;
      
      // Initial positions - completely random and chaotic across the whole canvas
      const chaosSpread = 150;
      
      // Create 1-2 hub nodes based on cluster size
      const hubCount = nodeCount > 8 ? 2 : 1;
      
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
          size: 4.5 + Math.random() * 2, // Bigger hubs
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
        
        // Organized target position in tighter formation
        const angle = (s / spokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const radiusVariation = Math.random() * 2; // Less variation for tighter clusters
        const radius = hubRadius + radiusVariation;
        
        generatedNodes.push({
          id: nodeId++,
          x: spokeInitialX,
          y: spokeInitialY,
          targetX: targetCenterX + Math.cos(angle) * radius,
          targetY: targetCenterY + Math.sin(angle) * radius,
          size: 2 + Math.random() * 2, // Bigger spokes
        });
      }
    });

    // Generate edges with short connections only
    const generatedEdges: Edge[] = [];
    let currentNodeIndex = 0;
    
    clusters.forEach((cluster) => {
      const { nodeCount } = cluster;
      const hubCount = nodeCount > 8 ? 2 : 1;
      
      const clusterHubs = generatedNodes.slice(currentNodeIndex, currentNodeIndex + hubCount);
      
      // Connect hubs within cluster if there are 2
      if (hubCount === 2) {
        generatedEdges.push({ from: clusterHubs[0], to: clusterHubs[1] });
      }
      
      // Connect spokes to nearest hub
      for (let s = hubCount; s < nodeCount; s++) {
        const spokeNode = generatedNodes[currentNodeIndex + s];
        const targetHub = clusterHubs[s % hubCount];
        generatedEdges.push({ from: targetHub, to: spokeNode });
        
        // Connect some spokes to each other for web effect (only nearby)
        if (s > hubCount + 1 && Math.random() > 0.7) {
          const nearbySpoke = generatedNodes[currentNodeIndex + s - 1];
          generatedEdges.push({ from: nearbySpoke, to: spokeNode });
        }
      }
      
      currentNodeIndex += nodeCount;
    });
    
    // Add extensive cross-cluster connections for one big network
    hubNodes.forEach((hub, i) => {
      hubNodes.slice(i + 1).forEach((otherHub) => {
        // Calculate distance in target positions
        const distance = Math.sqrt(
          Math.pow(hub.targetX - otherHub.targetX, 2) + 
          Math.pow(hub.targetY - otherHub.targetY, 2)
        );
        
        // Connect all hubs that are reasonably close
        if (distance < 35 && Math.random() > 0.3) {
          generatedEdges.push({ from: hub, to: otherHub });
        }
      });
    });
    
    // Add more inter-cluster connections between spokes of different clusters
    currentNodeIndex = 0;
    clusters.forEach((cluster, clusterIdx) => {
      const { nodeCount } = cluster;
      const hubCount = nodeCount > 8 ? 2 : 1;
      
      // Get some spoke nodes from this cluster
      const spokeNodes = generatedNodes.slice(
        currentNodeIndex + hubCount, 
        currentNodeIndex + Math.min(hubCount + 3, nodeCount)
      );
      
      // Connect to spokes in next cluster
      if (clusterIdx < clusters.length - 1) {
        const nextClusterStart = currentNodeIndex + nodeCount;
        const nextCluster = clusters[clusterIdx + 1];
        const nextHubCount = nextCluster.nodeCount > 8 ? 2 : 1;
        const nextSpokeNodes = generatedNodes.slice(
          nextClusterStart + nextHubCount,
          nextClusterStart + Math.min(nextHubCount + 2, nextCluster.nodeCount)
        );
        
        // Create 2-3 connections between cluster spokes
        spokeNodes.slice(0, 2).forEach((spoke, idx) => {
          if (nextSpokeNodes[idx] && Math.random() > 0.5) {
            generatedEdges.push({ from: spoke, to: nextSpokeNodes[idx] });
          }
        });
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
