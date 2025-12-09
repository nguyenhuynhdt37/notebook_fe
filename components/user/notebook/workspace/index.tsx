"use client";

import { useState } from "react";
import {
  Menu,
  X,
  PanelLeftClose,
  PanelRightClose,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Chat from "@/components/user/notebook/workspace/chat";
import SourcesPanel from "./sources-panel";
import AIFeaturesPanel from "./ai-features-panel";
import WorkspaceHeader from "./workspace-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NotebookWorkspaceProps {
  notebookId: string;
  accessToken?: string;
}

export default function NotebookWorkspace({
  notebookId,
  accessToken,
}: NotebookWorkspaceProps) {
  const [showSources, setShowSources] = useState(true);
  const [showAIFeatures, setShowAIFeatures] = useState(true);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [expandedSources, setExpandedSources] = useState(false);
  const [expandedChat, setExpandedChat] = useState(false);
  const [expandedAIFeatures, setExpandedAIFeatures] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkspaceHeader>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSources(!showSources)}
                  className="lg:hidden"
                >
                  {showSources ? (
                    <PanelLeftClose className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showSources ? "Ẩn nguồn" : "Hiện nguồn"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIFeatures(!showAIFeatures)}
                  className="lg:hidden"
                >
                  {showAIFeatures ? (
                    <PanelRightClose className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {showAIFeatures ? "Ẩn tính năng AI" : "Hiện tính năng AI"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </WorkspaceHeader>

      <div className="flex-1 overflow-hidden flex bg-gradient-to-br from-muted/5 via-background to-muted/5">
        {/* Sources Panel - Left */}
        {showSources && (
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-300 border-r border-border/50 bg-background/80 backdrop-blur-sm shadow-[2px_0_12px_rgba(0,0,0,0.03)] relative",
              expandedSources
                ? "flex-[3]"
                : expandedChat || expandedAIFeatures
                ? "flex-[0.5]"
                : "flex-[1]"
            )}
          >
            <div className="absolute top-2 right-2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 bg-background/90 hover:bg-background border border-border/50 shadow-sm"
                      onClick={() => {
                        if (expandedSources) {
                          // Thu nhỏ: reset tất cả về mặc định
                          setExpandedSources(false);
                          setExpandedChat(false);
                          setExpandedAIFeatures(false);
                        } else {
                          // Phóng to: chỉ phóng to sources, thu nhỏ các panel khác
                          setExpandedSources(true);
                          setExpandedChat(false);
                          setExpandedAIFeatures(false);
                        }
                      }}
                    >
                      {expandedSources ? (
                        <Minimize2 className="size-3.5" />
                      ) : (
                        <Maximize2 className="size-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expandedSources ? "Thu nhỏ" : "Phóng to"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <SourcesPanel
              notebookId={notebookId}
              onSelectionChange={setSelectedFileIds}
            />
          </div>
        )}

        {/* Chat Panel - Center */}
        <div
          className={cn(
            "min-w-0 overflow-hidden bg-background shadow-[inset_0_0_30px_rgba(0,0,0,0.02)] relative",
            expandedChat
              ? "flex-[3]"
              : expandedSources || expandedAIFeatures
              ? "flex-[1]"
              : "flex-[2]"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/3 pointer-events-none" />
          <div className="absolute top-2 right-2 z-20 pointer-events-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 bg-background/90 hover:bg-background border border-border/50 shadow-sm"
                    onClick={() => {
                      if (expandedChat) {
                        // Thu nhỏ: reset tất cả về mặc định
                        setExpandedChat(false);
                        setExpandedSources(false);
                        setExpandedAIFeatures(false);
                      } else {
                        // Phóng to: chỉ phóng to chat, thu nhỏ các panel khác
                        setExpandedChat(true);
                        setExpandedSources(false);
                        setExpandedAIFeatures(false);
                      }
                    }}
                  >
                    {expandedChat ? (
                      <Minimize2 className="size-3.5" />
                    ) : (
                      <Maximize2 className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{expandedChat ? "Thu nhỏ" : "Phóng to"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Chat
            notebookId={notebookId}
            accessToken={accessToken}
            selectedFileIds={selectedFileIds}
          />
        </div>

        {/* AI Features Panel - Right */}
        {showAIFeatures && (
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all duration-300 border-l border-border/50 bg-background/80 backdrop-blur-sm shadow-[-2px_0_12px_rgba(0,0,0,0.03)] relative",
              expandedAIFeatures
                ? "flex-[3]"
                : expandedChat || expandedSources
                ? "flex-[0.5]"
                : "flex-[1]"
            )}
          >
            <div className="absolute top-2 right-2 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 bg-background/90 hover:bg-background border border-border/50 shadow-sm"
                      onClick={() => {
                        if (expandedAIFeatures) {
                          // Thu nhỏ: reset tất cả về mặc định
                          setExpandedAIFeatures(false);
                          setExpandedSources(false);
                          setExpandedChat(false);
                        } else {
                          // Phóng to: chỉ phóng to AI features, thu nhỏ các panel khác
                          setExpandedAIFeatures(true);
                          setExpandedSources(false);
                          setExpandedChat(false);
                        }
                      }}
                    >
                      {expandedAIFeatures ? (
                        <Minimize2 className="size-3.5" />
                      ) : (
                        <Maximize2 className="size-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{expandedAIFeatures ? "Thu nhỏ" : "Phóng to"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <AIFeaturesPanel notebookId={notebookId} />
          </div>
        )}
      </div>
    </div>
  );
}
