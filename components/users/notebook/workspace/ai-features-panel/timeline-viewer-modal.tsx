"use client";

import { useEffect, useState, useCallback, memo } from "react";
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
  Panel,
  MarkerType,
  EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Clock,
  Loader2,
  AlertCircle,
  X,
  Calendar,
  Network,
  AlertTriangle,
  Flag,
  Zap,
  History,
  GitBranch,
  Scale,
  Lightbulb,
  Activity,
  Move,
  ZoomIn,
  CheckCircle2,
} from "lucide-react";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TimelineResponse, TimelineEvent } from "@/types/user/ai-task";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  aiSetId: string | null;
}

// Trục timeline
const TIMELINE_Y = 400;

// Khoảng cách card so với trục (trên/dưới)
const SPACING_ABOVE = 200;
const SPACING_BELOW = 200;

// Khoảng cách giữa các node theo trục X
const X_SPACING = 320;

// Handle (mỏ neo) đặt gần trục: lệch trái/phải 1 chút để nhìn ra “dòng chảy”
const HANDLE_OFFSET_PX = 18;

const iconMap: Record<string, React.ElementType> = {
  history: History,
  network: Network,
  protocol: GitBranch,
  release: Zap,
  concept: Lightbulb,
  law: Scale,
  event: Activity,
  warning: AlertTriangle,
  milestone: Flag,
  process: Activity,
  default: Clock,
};

interface TimelineNodeData extends Record<string, unknown> {
  event: TimelineEvent;
  importance: "minor" | "normal" | "major" | "critical";
  date: string;
  datePrecision: string;
  isAbove: boolean;
  index: number;
  axisGap: number; // khoảng cách từ card xuống trục
}

// --- Helper Functions ---

function formatDate(date: string, precision: string) {
  if (!date || date === "unknown" || precision === "unknown") return null;
  if (precision === "year") return date;
  if (precision === "month") {
    const parts = date.split("-");
    return parts.length >= 2 ? `${parts[1]}/${parts[0]}` : date;
  }
  if (precision === "day") {
    try {
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }
  return date;
}

// --- Custom Edge: đi xuống trục → đi ngang → đi lên ---

function roundCornerPath(
  sx: number,
  sy: number,
  midY: number,
  tx: number,
  ty: number,
  radius: number
) {
  // Path kiểu elbow bo góc nhẹ
  // sx,sy -> (sx,midY) -> (tx,midY) -> tx,ty
  const r = Math.max(0, radius);

  const dir1 = midY > sy ? 1 : -1; // đi xuống hay đi lên
  const dir2 = tx > sx ? 1 : -1; // đi sang phải hay trái
  const dir3 = ty > midY ? 1 : -1;

  const p1x = sx;
  const p1y = midY - dir1 * r;

  const c1x = sx;
  const c1y = midY;

  const p2x = sx + dir2 * r;
  const p2y = midY;

  const p3x = tx - dir2 * r;
  const p3y = midY;

  const c2x = tx;
  const c2y = midY;

  const p4x = tx;
  const p4y = midY + dir3 * r;

  return `
    M ${sx} ${sy}
    L ${p1x} ${p1y}
    Q ${c1x} ${c1y} ${p2x} ${p2y}
    L ${p3x} ${p3y}
    Q ${c2x} ${c2y} ${p4x} ${p4y}
    L ${tx} ${ty}
  `;
}

const TimelineAxisEdge = memo((props: EdgeProps) => {
  const { sourceX, sourceY, targetX, targetY, markerEnd, style } = props;

  const midY = TIMELINE_Y;
  const d = roundCornerPath(sourceX, sourceY, midY, targetX, targetY, 12);

  return (
    <path
      d={d}
      fill="none"
      stroke="rgba(0,0,0,0.35)"
      strokeWidth={3}
      style={style}
      markerEnd={markerEnd}
    />
  );
});
TimelineAxisEdge.displayName = "TimelineAxisEdge";

const edgeTypes = {
  timelineAxis: TimelineAxisEdge,
};

// --- Node Component ---

const TimelineNodeComponent = memo(
  ({ data, selected }: { data: TimelineNodeData; selected?: boolean }) => {
    const { event, isAbove, importance, axisGap } = data;
    const iconKey = event.icon ? event.icon.toLowerCase() : "default";
    const Icon = iconMap[iconKey] || iconMap.default;
    const dateText = formatDate(event.date, event.datePrecision);

    const getStyles = (imp: string) => {
      switch (imp) {
        case "critical":
          return {
            card: "border-red-200 dark:border-red-900 shadow-sm",
            iconBox: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
            badge:
              "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
            dot: "bg-red-500",
          };
        case "major":
          return {
            card: "border-foreground/20 shadow-sm ring-1 ring-foreground/5",
            iconBox: "bg-foreground text-background",
            badge: "border-foreground/20 bg-foreground/5 text-foreground",
            dot: "bg-foreground",
          };
        default:
          return {
            card: "border-border hover:border-foreground/30 transition-colors",
            iconBox: "bg-muted text-muted-foreground",
            badge: "border-border bg-muted/50 text-muted-foreground",
            dot: "bg-border",
          };
      }
    };

    const styles = getStyles(importance);

    // Node ở trên -> handle nằm dưới (Bottom); Node ở dưới -> handle nằm trên (Top)
    const axisHandlePosition = isAbove ? Position.Bottom : Position.Top;

    // Ẩn hoàn toàn handle UI (loại bỏ “mỏ neo” tròn ở giữa), vẫn giữ anchor để nối edge.
    const hiddenHandleClass =
      "!opacity-0 !w-0 !h-0 !border-0 !bg-transparent !p-0";

    return (
      <div
        className={cn(
          "relative w-[280px] group transition-all duration-300",
          selected && "scale-105 z-20"
        )}
      >
        {/* === Handles (ẩn UI hoàn toàn) === */}
        <Handle
          id="in"
          type="target"
          position={axisHandlePosition}
          className={hiddenHandleClass}
          isConnectable={false}
          style={{
            left: `calc(50% - ${HANDLE_OFFSET_PX}px)`,
          }}
        />
        <Handle
          id="out"
          type="source"
          position={axisHandlePosition}
          className={hiddenHandleClass}
          isConnectable={false}
          style={{
            left: `calc(50% + ${HANDLE_OFFSET_PX}px)`,
          }}
        />

        {/* Card */}
        <Card
          className={cn(
            "transition-all duration-300 h-full border-2",
            "group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:-translate-y-1",
            styles.card,
            importance === "critical" && "shadow-red-500/10",
            selected &&
              "border-primary ring-2 ring-primary ring-offset-2 shadow-xl"
          )}
        >
          <CardHeader className="p-4 pb-2 space-y-0">
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  "p-2 rounded-md shrink-0 transition-colors shadow-sm",
                  styles.iconBox,
                  selected && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="size-4" />
              </div>
              {dateText && (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] shrink-0 h-5 px-1.5 bg-background shadow-sm",
                    selected && "border-primary text-primary"
                  )}
                >
                  {dateText}
                </Badge>
              )}
            </div>
            <CardTitle
              className={cn(
                "text-sm font-semibold leading-tight pt-3 line-clamp-2",
                selected && "text-primary"
              )}
            >
              {event.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {event.description}
            </p>

            {(importance === "critical" || importance === "major") && (
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-wider h-5 px-1.5 font-semibold",
                    styles.badge
                  )}
                >
                  {importance}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);
TimelineNodeComponent.displayName = "TimelineNodeComponent";

const nodeTypes = {
  timeline: TimelineNodeComponent,
};

// --- Main Component ---

export default function TimelineViewerModal({
  open,
  onOpenChange,
  notebookId,
  aiSetId,
}: Props) {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<TimelineNodeData>
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] =
    useState<Node<TimelineNodeData> | null>(null);

  const fetchData = useCallback(async () => {
    if (!notebookId || !aiSetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<TimelineResponse>(
        `/user/notebooks/${notebookId}/ai/timeline/${aiSetId}`
      );
      setData(res.data);
    } catch (err: unknown) {
      const msg = (
        err as { response?: { data?: { error?: string; message?: string } } }
      ).response?.data;
      setError(msg?.error || msg?.message || "Không thể tải timeline.");
    } finally {
      setLoading(false);
    }
  }, [notebookId, aiSetId]);

  useEffect(() => {
    if (open && aiSetId) fetchData();
  }, [open, aiSetId, fetchData]);

  useEffect(() => {
    if (!data?.events?.length) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const sortedEvents = [...data.events].sort((a, b) => a.order - b.order);

    const newNodes: Node<TimelineNodeData>[] = sortedEvents.map(
      (event, index) => {
        const isAbove = index % 2 === 0;

        const x = index * X_SPACING + 150;
        const y = isAbove
          ? TIMELINE_Y - SPACING_ABOVE
          : TIMELINE_Y + SPACING_BELOW;

        return {
          id: event.id,
          type: "timeline",
          position: { x, y },
          data: {
            event,
            importance: event.importance,
            date: event.date,
            datePrecision: event.datePrecision,
            isAbove,
            index,
            axisGap: isAbove ? SPACING_ABOVE : SPACING_BELOW,
          },
        };
      }
    );

    const newEdges: Edge[] = [];
    if (sortedEvents.length > 1) {
      for (let i = 0; i < sortedEvents.length - 1; i++) {
        const source = sortedEvents[i];
        const target = sortedEvents[i + 1];

        newEdges.push({
          id: `e-${source.id}-${target.id}`,
          source: source.id,
          target: target.id,
          sourceHandle: "out",
          targetHandle: "in",
          type: "timelineAxis",
          animated: false,
          style: {
            strokeWidth: 3,
            stroke: "rgba(0,0,0,0.35)",
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: "rgba(0,0,0,0.35)",
          },
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-screen h-screen m-0 rounded-none border-none p-0 gap-0 bg-background/95 backdrop-blur-xl shadow-none flex flex-col sm:max-w-none sm:rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0 data-[state=open]:!slide-in-from-bottom-0 data-[state=open]:!slide-in-from-left-0">
        {/* Header */}
        <div className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-muted">
              <Activity className="size-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                {data?.title || "Timeline View"}
                {data?.totalEvents !== undefined && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-normal"
                  >
                    {data.totalEvents} Events
                  </Badge>
                )}
              </DialogTitle>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 relative w-full h-full bg-muted/5">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Generating timeline layout...
              </p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="size-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData}>
                Try Again
              </Button>
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Clock className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No timeline events found.
              </p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) =>
                setSelectedNode(node as Node<TimelineNodeData>)
              }
              onPaneClick={() => setSelectedNode(null)}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
              className="bg-muted/5 touch-none"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="currentColor"
                className="opacity-[0.15]"
              />

              <Controls
                showInteractive={false}
                className="bg-background border shadow-sm rounded-lg overflow-hidden m-4"
              />

              <Panel position="top-right" className="m-4">
                <div className="bg-background/80 backdrop-blur-sm border shadow-sm rounded-lg p-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <Move className="size-3" /> <span>Drag to pan</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <ZoomIn className="size-3" /> <span>Scroll to zoom</span>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          )}

          {/* Details Sidebar (Overlay) */}
          {selectedNode && (
            <div className="absolute right-0 top-0 bottom-0 w-[350px] border-l bg-background/95 backdrop-blur shadow-xl animate-in slide-in-from-right-10 duration-200 z-10 flex flex-col">
              <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
                <span className="text-sm font-medium">Event Details</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="uppercase text-[10px] tracking-wider font-semibold"
                      >
                        {selectedNode.data.importance}
                      </Badge>

                      {formatDate(
                        selectedNode.data.event.date,
                        selectedNode.data.event.datePrecision
                      ) && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDate(
                            selectedNode.data.event.date,
                            selectedNode.data.event.datePrecision
                          )}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold leading-tight mb-2">
                      {selectedNode.data.event.title}
                    </h3>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {selectedNode.data.event.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="size-3" />
                        <span className="text-[10px] font-medium uppercase">
                          Date
                        </span>
                      </div>
                      <p className="text-xs font-mono">
                        {selectedNode.data.event.date === "unknown"
                          ? "N/A"
                          : selectedNode.data.event.date}
                      </p>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CheckCircle2 className="size-3" />
                        <span className="text-[10px] font-medium uppercase">
                          Precision
                        </span>
                      </div>
                      <p className="text-xs font-mono bg-muted px-1.5 rounded inline-block">
                        {selectedNode.data.event.datePrecision}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
