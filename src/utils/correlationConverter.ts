import { Node, Edge } from 'reactflow';

interface Correlation {
  var1: string;
  var2: string;
  coefficient: number;
  pValue?: number;
  n?: number;
}

interface CorrelationMatrix {
  correlations: Correlation[];
  statistics: {
    totalVariables: number;
    totalObservations: number;
    missingPercent: string;
    threshold: number;
    totalCorrelations: number | string;
  };
}

/**
 * Convert correlation matrix to ReactFlow network
 * Variables become nodes, correlations become edges
 */
export const convertCorrelationToNetwork = (
  correlationData: CorrelationMatrix,
  variableNames: string[]
): { nodes: Node[]; edges: Edge[] } => {
  // Create a map to track node degree (number of connections)
  const nodeDegree = new Map<string, number>();
  
  // Count connections for each variable
  correlationData.correlations.forEach(corr => {
    nodeDegree.set(corr.var1, (nodeDegree.get(corr.var1) || 0) + 1);
    nodeDegree.set(corr.var2, (nodeDegree.get(corr.var2) || 0) + 1);
  });

  // Detect variable categories based on prefixes
  const getCategory = (varName: string): { category: string; color: string } => {
    const name = varName.toLowerCase();
    if (name.includes('adhd')) return { category: 'ADHD', color: 'hsl(355, 70%, 55%)' };
    if (name.includes('anxiety')) return { category: 'Anxiety', color: 'hsl(195, 70%, 55%)' };
    if (name.includes('depression')) return { category: 'Depression', color: 'hsl(240, 70%, 60%)' };
    if (name.includes('anger')) return { category: 'Anger', color: 'hsl(15, 75%, 55%)' };
    if (name.includes('pts')) return { category: 'PTSD', color: 'hsl(280, 65%, 55%)' };
    if (name.includes('psychosis')) return { category: 'Psychosis', color: 'hsl(320, 70%, 55%)' };
    if (name.includes('sleep')) return { category: 'Sleep', color: 'hsl(210, 60%, 55%)' };
    if (name.includes('substance')) return { category: 'Substance', color: 'hsl(30, 70%, 50%)' };
    if (name.includes('stress')) return { category: 'Stress', color: 'hsl(45, 75%, 50%)' };
    if (name.includes('relationship')) return { category: 'Relationship', color: 'hsl(330, 65%, 55%)' };
    if (name.includes('interpersonal')) return { category: 'Interpersonal', color: 'hsl(160, 60%, 50%)' };
    return { category: 'Other', color: 'hsl(0, 0%, 50%)' };
  };

  // Create nodes for each variable
  const nodes: Node[] = variableNames.map((varName, index) => {
    const degree = nodeDegree.get(varName) || 0;
    const { category, color } = getCategory(varName);
    
    // Size based on degree centrality (more connections = larger node)
    const baseSize = 60;
    const maxSize = 140;
    const size = Math.min(maxSize, baseSize + (degree * 8));
    
    // Clean up variable name for display
    const displayName = varName
      .replace(/IMHA_/g, '')
      .replace(/_/g, ' ')
      .replace(/(\d+)$/, '');

    return {
      id: varName,
      type: 'default',
      position: {
        // Circular layout based on category
        x: 400 + Math.cos((index * 2 * Math.PI) / variableNames.length) * 350,
        y: 300 + Math.sin((index * 2 * Math.PI) / variableNames.length) * 350,
      },
      data: {
        label: displayName,
        tags: [category],
        degree: degree,
      },
      style: {
        background: color,
        color: 'white',
        border: `2px solid ${adjustColorBrightness(color, 15)}`,
        borderRadius: '50%',
        padding: '8px',
        fontSize: '11px',
        fontWeight: '500',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: `0 4px 16px ${color}40`,
      },
    };
  });

  // Create edges for correlations
  const edges: Edge[] = correlationData.correlations.map((corr, index) => {
    const isPositive = corr.coefficient > 0;
    const strength = Math.abs(corr.coefficient);
    
    // Color based on correlation direction
    const edgeColor = isPositive 
      ? `hsl(195, ${50 + strength * 50}%, ${45 + strength * 15}%)` // Blue for positive
      : `hsl(15, ${50 + strength * 50}%, ${45 + strength * 15}%)`; // Red for negative
    
    // Width based on correlation strength
    const strokeWidth = 1 + (strength * 4);
    
    return {
      id: `corr-${index}`,
      source: corr.var1,
      target: corr.var2,
      type: 'smoothstep',
      animated: strength > 0.7, // Animate strong correlations
      style: {
        stroke: edgeColor,
        strokeWidth,
        opacity: 0.4 + (strength * 0.5),
      },
      label: corr.coefficient.toFixed(2),
      labelStyle: {
        fontSize: '10px',
        fontWeight: '600',
        fill: edgeColor,
      },
      labelBgStyle: {
        fill: 'hsl(var(--background))',
        fillOpacity: 0.85,
      },
      data: {
        coefficient: corr.coefficient,
        pValue: corr.pValue,
        n: corr.n,
      },
    };
  });

  return { nodes, edges };
};

/**
 * Adjust color brightness (helper function)
 */
function adjustColorBrightness(color: string, percent: number): string {
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [, h, s, l] = match;
      const newL = Math.min(100, Math.max(0, parseInt(l) + percent));
      return `hsl(${h}, ${s}%, ${newL}%)`;
    }
  }
  return color;
}
