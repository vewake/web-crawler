import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Node,
  Edge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Globe, ExternalLink, Layers, Search, Download, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  url: string;
  title: string;
  depth: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Custom node component with enhanced styling
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const depthColors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-rose-500',
  ];

  const colorClass = depthColors[data.depth % depthColors.length];
  const isRoot = data.depth === 0;
  const isHighlighted = data.highlighted;
  const isInPath = data.inPath;

  return (
    <div style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ background: '#8b5cf6', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#8b5cf6', width: 10, height: 10 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#8b5cf6', width: 10, height: 10 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#8b5cf6', width: 10, height: 10 }} />

      <div
        className={`px-4 py-3 rounded-lg border-2 shadow-lg transition-all duration-300 ${isHighlighted || selected
          ? 'border-yellow-400 shadow-2xl scale-110 ring-4 ring-yellow-300'
          : isInPath
            ? 'border-blue-400 shadow-xl scale-105 ring-2 ring-blue-200'
            : isRoot
              ? 'border-purple-400 hover:shadow-xl hover:scale-105'
              : 'border-gray-300 hover:shadow-xl hover:scale-105'
          }`}
        style={{
          background: `linear-gradient(135deg, ${isHighlighted || selected
            ? 'rgb(251, 191, 36), rgb(245, 158, 11)'
            : isInPath
              ? 'rgb(147, 197, 253), rgb(96, 165, 250)'
              : isRoot
                ? 'rgb(147, 51, 234), rgb(219, 39, 119)'
                : 'rgb(255, 255, 255), rgb(243, 244, 246)'
            })`,
          minWidth: isRoot ? '180px' : '150px',
          opacity: data.dimmed ? 0.3 : 1,
        }}
      >
        <div className="flex items-start gap-2">
          <div className={`p-2 rounded-full bg-gradient-to-br ${colorClass} ${isRoot ? 'bg-white/20' : 'bg-opacity-10'}`}>
            {isRoot ? (
              <Globe className={`w-5 h-5 ${isRoot || isHighlighted || isInPath ? 'text-white' : 'text-gray-700'}`} />
            ) : (
              <ExternalLink className={`w-4 h-4 ${isHighlighted || isInPath ? 'text-white' : 'text-gray-700'}`} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-semibold text-sm truncate ${isRoot || isHighlighted || isInPath ? 'text-white' : 'text-gray-900'}`}>
              {data.title}
            </div>
            <div className={`text-xs truncate mt-1 ${isRoot || isHighlighted || isInPath ? 'text-purple-100' : 'text-gray-500'}`}>
              {data.url}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${isRoot || isHighlighted || isInPath ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Depth: {data.depth}
              </span>
              {data.childCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${isRoot || isHighlighted || isInPath ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {data.childCount} links
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Sample data
const sampleData: GraphData = {
  nodes: [
    { id: '1', url: 'https://example.com', title: 'Homepage', depth: 0 },
    { id: '2', url: 'https://example.com/about', title: 'About Us', depth: 1 },
    { id: '3', url: 'https://example.com/products', title: 'Products', depth: 1 },
    { id: '4', url: 'https://example.com/contact', title: 'Contact', depth: 1 },
    { id: '5', url: 'https://example.com/products/item1', title: 'Product 1', depth: 2 },
    { id: '6', url: 'https://example.com/products/item2', title: 'Product 2', depth: 2 },
    { id: '7', url: 'https://example.com/about/team', title: 'Our Team', depth: 2 },
    { id: '8', url: 'https://example.com/about/history', title: 'History', depth: 2 },
    { id: '9', url: 'https://example.com/products/item1/details', title: 'Product 1 Details', depth: 3 },
    { id: '10', url: 'https://example.com/products/item2/details', title: 'Product 2 Details', depth: 3 },
  ],
  links: [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '1', target: '4' },
    { source: '3', target: '5' },
    { source: '3', target: '6' },
    { source: '2', target: '7' },
    { source: '2', target: '8' },
    { source: '5', target: '9' },
    { source: '6', target: '10' },
  ],
};

export default function GraphVisualization({ data = sampleData }: { data?: GraphData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedLayout, setSelectedLayout] = useState<'hierarchical' | 'radial' | 'force'>('hierarchical');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);

  // Build adjacency map for path finding
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const reverseMap = new Map<string, Set<string>>();

    data.links.forEach((link) => {
      if (!map.has(link.source)) map.set(link.source, new Set());
      if (!reverseMap.has(link.target)) reverseMap.set(link.target, new Set());

      map.get(link.source)!.add(link.target);
      reverseMap.get(link.target)!.add(link.source);
    });

    return { forward: map, reverse: reverseMap };
  }, [data.links]);

  // Find path from root to selected node
  const findPathFromRoot = useCallback((nodeId: string) => {
    const path = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      path.add(current);

      const parents = adjacencyMap.reverse.get(current);
      if (parents) {
        parents.forEach((parent) => {
          if (!visited.has(parent)) {
            queue.push(parent);
          }
        });
      }
    }

    return path;
  }, [adjacencyMap]);

  // Find all descendants
  const findDescendants = useCallback((nodeId: string) => {
    const descendants = new Set<string>();
    const queue = [nodeId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      descendants.add(current);

      const children = adjacencyMap.forward.get(current);
      if (children) {
        children.forEach((child) => {
          if (!visited.has(child)) {
            queue.push(child);
          }
        });
      }
    }

    return descendants;
  }, [adjacencyMap]);

  // Calculate layout positions
  const calculateLayout = useCallback((layout: 'hierarchical' | 'radial' | 'force') => {
    const depthMap = new Map<number, GraphNode[]>();
    data.nodes.forEach((node) => {
      if (!depthMap.has(node.depth)) {
        depthMap.set(node.depth, []);
      }
      depthMap.get(node.depth)!.push(node);
    });

    const positions = new Map<string, { x: number; y: number }>();

    if (layout === 'hierarchical') {
      depthMap.forEach((nodes, depth) => {
        const spacing = 300;
        const totalWidth = (nodes.length - 1) * spacing;
        const startX = -totalWidth / 2;
        nodes.forEach((node, index) => {
          positions.set(node.id, {
            x: startX + index * spacing,
            y: depth * 200,
          });
        });
      });
    } else if (layout === 'radial') {
      depthMap.forEach((nodes, depth) => {
        const radius = depth === 0 ? 0 : 150 + depth * 180;
        const angleStep = (Math.PI * 2) / Math.max(nodes.length, 1);
        nodes.forEach((node, index) => {
          const angle = angleStep * index;
          positions.set(node.id, {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
          });
        });
      });
    } else {
      data.nodes.forEach((node, i) => {
        const angle = (i / data.nodes.length) * Math.PI * 2;
        const radius = 100 + node.depth * 150;
        positions.set(node.id, {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
        });
      });
    }

    return positions;
  }, [data]);

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
  }, [selectedNodeId]);

  // Update nodes and edges
  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;

    const positions = calculateLayout(selectedLayout);

    // Calculate child count for each node
    const childCountMap = new Map<string, number>();
    data.links.forEach((link) => {
      childCountMap.set(link.source, (childCountMap.get(link.source) || 0) + 1);
    });

    // Get highlighted nodes
    let highlightedNodes = new Set<string>();
    let pathNodes = new Set<string>();

    if (selectedNodeId) {
      highlightedNodes.add(selectedNodeId);
      pathNodes = findPathFromRoot(selectedNodeId);
      const descendants = findDescendants(selectedNodeId);
      descendants.forEach((id) => pathNodes.add(id));
    }

    const flowNodes: Node[] = data.nodes.map((node) => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      const isHighlighted = highlightedNodes.has(node.id);
      const isInPath = pathNodes.has(node.id) && !isHighlighted;
      const isDimmed = selectedNodeId && !highlightedNodes.has(node.id) && !pathNodes.has(node.id);

      return {
        id: node.id,
        type: 'custom',
        position: pos,
        data: {
          title: node.title,
          url: node.url,
          depth: node.depth,
          childCount: childCountMap.get(node.id) || 0,
          highlighted: isHighlighted,
          inPath: isInPath,
          dimmed: isDimmed,
        },
      };
    });

    const highlightedEdges = new Set<string>();
    if (selectedNodeId) {
      data.links.forEach((link) => {
        if (pathNodes.has(link.source) && pathNodes.has(link.target)) {
          highlightedEdges.add(`${link.source}-${link.target}`);
        }
      });
    }

    const flowEdges: Edge[] = data.links.map((link) => {
      const edgeKey = `${link.source}-${link.target}`;
      const isHighlighted = highlightedEdges.has(edgeKey);
      const isDimmed = selectedNodeId && !isHighlighted;

      return {
        id: `edge-${edgeKey}`,
        source: link.source,
        target: link.target,
        type: 'smoothstep',
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#3b82f6' : '#8b5cf6',
          strokeWidth: isHighlighted ? 4 : 2,
          opacity: isDimmed ? 0.2 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: isHighlighted ? 30 : 25,
          height: isHighlighted ? 30 : 25,
          color: isHighlighted ? '#3b82f6' : '#8b5cf6',
        },
      };
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [data, selectedLayout, selectedNodeId, setNodes, setEdges, calculateLayout, findPathFromRoot, findDescendants]);

  const stats = useMemo(() => {
    const maxDepth = Math.max(...data.nodes.map((n) => n.depth), 0);
    const avgDepth = data.nodes.reduce((sum, n) => sum + n.depth, 0) / data.nodes.length;
    return {
      totalNodes: data.nodes.length,
      totalLinks: data.links.length,
      maxDepth: maxDepth,
      avgDepth: avgDepth.toFixed(1),
    };
  }, [data]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return null;
    return data.nodes.filter((node) =>
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data.nodes]);

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'graph-data.json';
    link.click();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-slate-50"
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls className="bg-white shadow-lg rounded-lg border border-slate-200" />
        <MiniMap
          className="bg-white shadow-lg rounded-lg border border-slate-200"
          nodeColor={(node) => {
            if (node.data.highlighted) return '#facc15';
            if (node.data.inPath) return '#60a5fa';
            const depth = node.data.depth;
            const colors = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
            return colors[depth % colors.length];
          }}
        />

        {showStats && (
          <Panel position="top-left" className="bg-white shadow-lg rounded-lg border border-slate-200 p-4 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Network Stats
              </h2>
              <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Total Nodes:</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{stats.totalNodes}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Total Links:</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{stats.totalLinks}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Max Depth:</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{stats.maxDepth}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Avg Depth:</span>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">{stats.avgDepth}</span>
              </div>
            </div>
            {selectedNodeId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500 mb-2">SELECTED NODE</div>
                <div className="text-sm text-gray-900 font-medium">
                  {data.nodes.find((n) => n.id === selectedNodeId)?.title}
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="mt-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </Panel>
        )}

        <Panel position="top-right" className="bg-white shadow-lg rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            Layout
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedLayout('hierarchical')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${selectedLayout === 'hierarchical'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Hierarchical
            </button>
            {/* <button */}
            {/*   onClick={() => setSelectedLayout('radial')} */}
            {/*   className={`px-3 py-2 rounded text-sm font-medium transition-colors ${selectedLayout === 'radial' */}
            {/*     ? 'bg-purple-600 text-white' */}
            {/*     : 'bg-gray-100 text-gray-700 hover:bg-gray-200' */}
            {/*     }`} */}
            {/* > */}
            {/*   Radial */}
            {/* </button> */}
            {/* <button */}
            {/*   onClick={() => setSelectedLayout('force')} */}
            {/*   className={`px-3 py-2 rounded text-sm font-medium transition-colors ${selectedLayout === 'force' */}
            {/*     ? 'bg-purple-600 text-white' */}
            {/*     : 'bg-gray-100 text-gray-700 hover:bg-gray-200' */}
            {/*     }`} */}
            {/* > */}
            {/*   Force-Directed */}
            {/* </button> */}
          </div>
        </Panel>

        {/* <Panel position="bottom-right" className="bg-white shadow-lg rounded-lg border border-slate-200 p-4"> */}
        {/*   <div className="space-y-3"> */}
        {/*     <div className="relative"> */}
        {/*       <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" /> */}
        {/*       <input */}
        {/*         type="text" */}
        {/*         placeholder="Search nodes..." */}
        {/*         value={searchTerm} */}
        {/*         onChange={(e) => setSearchTerm(e.target.value)} */}
        {/*         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" */}
        {/*       /> */}
        {/*     </div> */}
        {/*     {filteredNodes && filteredNodes.length > 0 && ( */}
        {/*       <div className="max-h-40 overflow-y-auto space-y-1"> */}
        {/*         {filteredNodes.map((node) => ( */}
        {/*           <button */}
        {/*             key={node.id} */}
        {/*             onClick={() => setSelectedNodeId(node.id)} */}
        {/*             className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm transition-colors" */}
        {/*           > */}
        {/*             <div className="font-medium text-gray-900 truncate">{node.title}</div> */}
        {/*             <div className="text-xs text-gray-500 truncate">{node.url}</div> */}
        {/*           </button> */}
        {/*         ))} */}
        {/*       </div> */}
        {/*     )} */}
        {/*     <button */}
        {/*       onClick={exportData} */}
        {/*       className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2" */}
        {/*     > */}
        {/*       <Download className="w-4 h-4" /> */}
        {/*       Export JSON */}
        {/*     </button> */}
        {/*     {!showStats && ( */}
        {/*       <button */}
        {/*         onClick={() => setShowStats(true)} */}
        {/*         className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2" */}
        {/*       > */}
        {/*         <Info className="w-4 h-4" /> */}
        {/*         Show Stats */}
        {/*       </button> */}
        {/*     )} */}
        {/*   </div> */}
        {/* </Panel> */}

        {/* <Panel position="bottom-left" className="bg-white/90 backdrop-blur shadow-lg rounded-lg border border-slate-200 p-3"> */}
        {/*   <div className="text-xs text-gray-600 space-y-1"> */}
        {/*     <div className="font-semibold text-gray-900 mb-2">Legend</div> */}
        {/*     <div className="flex items-center gap-2"> */}
        {/*       <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400"></div> */}
        {/*       <span>Selected Node</span> */}
        {/*     </div> */}
        {/*     <div className="flex items-center gap-2"> */}
        {/*       <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-300 to-blue-500"></div> */}
        {/*       <span>Path Nodes</span> */}
        {/*     </div> */}
        {/*     <div className="flex items-center gap-2"> */}
        {/*       <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div> */}
        {/*       <span>Root Node</span> */}
        {/*     </div> */}
        {/*   </div> */}
        {/* </Panel> */}
      </ReactFlow>
    </div>
  );
}
