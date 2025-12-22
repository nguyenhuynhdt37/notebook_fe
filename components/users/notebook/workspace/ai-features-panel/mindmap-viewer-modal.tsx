"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Position,
  Handle,
  ConnectionLineType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  AlertCircle,
  Loader2,
  X,
  Network,
  PlusCircle,
  MinusCircle,
  Move,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { MindmapResponse, MindmapNode } from "@/types/user/mindmap";
import dagre from "dagre";
import { Card, CardContent } from "@/components/ui/card";

interface MindmapViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

// Custom Node Data Interface
interface CustomNodeData extends Record<string, unknown> {
  label: string;
  summary: string;
  isRoot: boolean;
  expanded: boolean;
  hasChildren: boolean;
  childrenIds?: string[];
  onToggle?: (id: string) => void;
  highlight?: "source" | "target" | "path";
}

// Custom node component
function MindmapNodeComponent({
  id,
  data,
}: {
  id: string;
  data: CustomNodeData;
}) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onToggle) {
      data.onToggle(id);
    }
  };

  const isSource = data.highlight === "source";
  const isTarget = data.highlight === "target";
  const isPath = data.highlight === "path";

  return (
    <div
      className={`relative group transition-all duration-300 min-w-[200px] max-w-[300px] rounded-xl shadow-sm ${
        data.isRoot
          ? "bg-primary text-primary-foreground border-2 border-primary"
          : isSource || isPath
          ? "bg-blue-50 border-2 border-blue-500 shadow-lg shadow-blue-100 scale-105"
          : isTarget
          ? "bg-green-50 border-2 border-green-500 shadow-lg shadow-green-100 scale-105"
          : "bg-background border border-border hover:border-primary/60 hover:shadow-md"
      }`}
    >
      {/* Highlight Label */}
      {(isSource || isTarget) && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm z-30 ${
            isSource ? "bg-blue-500" : "bg-green-500"
          }`}
        >
          {isSource ? "Cha" : "Con"}
        </div>
      )}

      {/* Target Handle (Input) */}
      {!data.isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          className={`!w-3 !h-3 !-ml-1.5 transition-colors duration-300 ${
            isTarget ? "!bg-green-500" : "!bg-border"
          }`}
          style={{ borderRadius: "50%" }}
        />
      )}

      {/* Node Content */}
      <div className="px-5 py-4">
        <h3
          className={`text-sm font-semibold leading-snug ${
            data.isRoot
              ? "text-primary-foreground text-center text-base"
              : isSource || isPath
              ? "text-blue-700"
              : isTarget
              ? "text-green-700"
              : "text-foreground"
          }`}
        >
          {data.label}
        </h3>
        {data.summary && (
          <p
            className={`text-xs mt-2 leading-relaxed line-clamp-4 ${
              data.isRoot
                ? "text-primary-foreground/80 text-center"
                : isSource || isPath
                ? "text-blue-600/80"
                : isTarget
                ? "text-green-600/80"
                : "text-muted-foreground"
            }`}
          >
            {data.summary}
          </p>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {data.hasChildren && (
        <button
          onClick={handleToggle}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 border transition-all z-20 cursor-pointer flex items-center justify-center bg-background shadow-sm ${
            data.expanded
              ? "text-muted-foreground border-border hover:text-foreground"
              : "text-primary border-primary hover:scale-110"
          }`}
        >
          {data.expanded ? (
            <MinusCircle className="size-5 bg-background rounded-full" />
          ) : (
            <PlusCircle className="size-5 bg-background rounded-full" />
          )}
        </button>
      )}

      {/* Source Handle (Output) */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !-mr-1.5 transition-colors duration-300 ${
          isSource || isPath ? "!bg-blue-500" : "!bg-border"
        }`}
        style={{ borderRadius: "50%" }}
      />
    </div>
  );
}

// Dagre Layout
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Cấu hình khoảng cách rộng hơn để tránh rối
  dagreGraph.setGraph({
    rankdir: "LR", // Left to Right
    ranksep: 350, // Khoảng cách giữa các cột
    nodesep: 150, // Khoảng cách giữa các hàng
    ranker: "tight-tree", // Giữ cấu trúc cây chặt chẽ hơn, tránh node con chạy lung tung
  });

  nodes.forEach((node) => {
    // Estimating size for layout specifically - slightly larger than CSS max-width to ensure spacing
    dagreGraph.setNode(node.id, { width: 320, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      // Shift anchor to center
      position: {
        x: nodeWithPosition.x - 320 / 2,
        y: nodeWithPosition.y - 150 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function MindmapViewerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: MindmapViewerModalProps) {
  const [mindmapResponse, setMindmapResponse] =
    useState<MindmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected edge state
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Expanded nodes set
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set()
  );

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = useMemo(() => ({ mindmap: MindmapNodeComponent }), []);

  // Function to process tree and generate nodes/edges based on expanded state
  const processTree = useCallback(
    (rootNode: MindmapNode, expandedIds: Set<string>) => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const visited = new Set<string>(); // Track visited nodes to enforce strict tree (1 parent)

      const traverse = (node: MindmapNode, parentId?: string) => {
        const nodeId = node.id;

        // Prevent infinite loops or DAG/Multiple-Parent issues
        // In a Mindmap, a node should strictly appear once in the hierarchy
        if (visited.has(nodeId)) {
          return;
        }
        visited.add(nodeId);

        const isExpanded = expandedIds.has(nodeId);
        const children = node.children || [];
        const hasChildren = children.length > 0;

        // Add Node
        newNodes.push({
          id: nodeId,
          type: "mindmap",
          data: {
            label: node.title,
            summary: node.summary,
            isRoot: !parentId,
            expanded: isExpanded,
            hasChildren: hasChildren,
            childrenIds: children.map((c) => c.id),
            onToggle: (id: string) => toggleNode(id),
          },
          position: { x: 0, y: 0 },
        });

        // Add Edge from parent
        if (parentId) {
          newEdges.push({
            id: `edge-${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            type: "default", // Bezier curve (dạng sóng)
            style: { stroke: "#94a3b8", strokeWidth: 2 },
            animated: false,
          });
        }

        // Recursion if expanded
        if (isExpanded && hasChildren) {
          children.forEach((child) => traverse(child, nodeId));
        }
      };

      if (rootNode) {
        traverse(rootNode);
      }
      return { nodes: newNodes, edges: newEdges };
    },
    []
  );

  const toggleNode = useCallback((id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Update layout when expanded set changes
  useEffect(() => {
    if (!mindmapResponse?.mindmap) return;

    const { nodes: rawNodes, edges: rawEdges } = processTree(
      mindmapResponse.mindmap,
      expandedNodeIds
    );

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [expandedNodeIds, mindmapResponse, processTree, setNodes, setEdges]);

  const fetchMindmap = useCallback(async () => {
    if (!notebookId || !aiSetId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<MindmapResponse>(
        `/user/notebooks/${notebookId}/ai/mindmap/${aiSetId}`
      );
      setMindmapResponse(response.data);

      if (response.data.mindmap) {
        const rootId = response.data.mindmap.id;
        // Auto expand root node only
        setExpandedNodeIds(new Set([rootId]));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải mindmap.");
    } finally {
      setLoading(false);
    }
  }, [aiSetId, notebookId]);

  useEffect(() => {
    if (open && aiSetId) {
      fetchMindmap();
      // Reset state
      setNodes([]);
      setEdges([]);
      setExpandedNodeIds(new Set());
      setSelectedEdgeId(null);
    }
  }, [open, aiSetId, fetchMindmap, setNodes, setEdges]);

  // Handle Edge Click
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, clickedEdge: Edge) => {
      setSelectedEdgeId(clickedEdge.id);

      // --- TRACE BACK PATH TO ROOT ---
      const targetNodeId = clickedEdge.target;
      const pathEdgeIds = new Set<string>();
      const pathNodeIds = new Set<string>(); // All ancestors + target

      // Add immediate target
      pathNodeIds.add(targetNodeId);
      // Add clicked edge
      pathEdgeIds.add(clickedEdge.id);

      // Traversal vars
      let currentEdge = clickedEdge;

      // Backtrack until root
      while (currentEdge) {
        const sourceNodeId = currentEdge.source;
        pathNodeIds.add(sourceNodeId);

        // Find parent edge (edge where old target == current edge source)
        // Note: edges is from closure (state dependency)
        // eslint-disable-next-line no-loop-func
        const parentEdge = edges.find((e) => e.target === sourceNodeId);
        if (parentEdge) {
          pathEdgeIds.add(parentEdge.id);
          currentEdge = parentEdge;
        } else {
          // No parent edge -> Reached root or detached
          break;
        }
      }

      // Highlight logic
      setEdges((eds) =>
        eds.map((e) => {
          if (pathEdgeIds.has(e.id)) {
            return {
              ...e,
              animated: true,
              style: {
                ...e.style,
                stroke: "#3b82f6", // blue-500
                strokeWidth: 3,
                opacity: 1,
              },
              zIndex: 10,
            };
          }
          return {
            ...e,
            animated: false,
            style: {
              ...e.style,
              stroke: "#94a3b8", // slate-400
              strokeWidth: 2,
              opacity: 0.2, // Dim others significantly
            },
            zIndex: 1,
          };
        })
      );

      setNodes((nds) =>
        nds.map((n) => {
          const isInPath = pathNodeIds.has(n.id);
          if (isInPath) {
            // Determine specific role
            let highlightType: "target" | "source" | "path" = "path";

            if (n.id === clickedEdge.target) {
              highlightType = "target"; // The leaf clicked
            } else if (n.id === clickedEdge.source) {
              highlightType = "source"; // The immediate parent
            }

            return {
              ...n,
              data: { ...n.data, highlight: highlightType },
              style: { ...n.style, opacity: 1 },
            };
          }
          // Non-path nodes
          return {
            ...n,
            data: { ...n.data, highlight: undefined },
            style: { ...n.style, opacity: 0.2 }, // Dim non-related nodes
          };
        })
      );
    },
    [edges, setEdges, setNodes]
  );

  // Handle Pane Click (Reset highlight)
  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);

    // Reset edges
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: false,
        style: {
          ...e.style,
          stroke: "#94a3b8",
          strokeWidth: 1.5,
          opacity: 1,
        },
        zIndex: 1,
      }))
    );

    // Reset nodes
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, highlight: undefined },
        style: { ...n.style, opacity: 1 },
      }))
    );
  }, [setEdges, setNodes]);

  // Keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="size-10 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Đang tải mindmap...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <AlertCircle className="size-10 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchMindmap}>
            Thử lại
          </Button>
        </div>
      );
    }
    if (!mindmapResponse) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Network className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">Không có dữ liệu mindmap.</p>
        </div>
      );
    }

    return (
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, duration: 800 }}
        minZoom={0.1}
        maxZoom={1.5}
        attributionPosition="bottom-left"
        nodesDraggable={true} // Cho phép kéo thả
        nodesConnectable={false}
        className="bg-muted/10"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#94a3b8"
        />
        <Controls showInteractive={true} position="bottom-right" />
        <Panel
          position="top-right"
          className="bg-background/80 p-2 rounded-lg border shadow-sm backdrop-blur"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Move className="size-3" />
            <span>Kéo để di chuyển • Cuộn để zoom</span>
          </div>
        </Panel>
      </ReactFlow>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="h-14 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Network className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">
              {mindmapResponse?.title || "Sơ đồ tư duy"}
            </h2>
            {mindmapResponse && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {nodes.length} nodes • {mindmapResponse.createdByName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">{renderContent()}</div>
    </div>
  );
}
