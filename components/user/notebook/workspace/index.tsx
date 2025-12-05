"use client";

import { useState } from "react";
import { Menu, X, PanelLeftClose, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chat from "@/components/user/notebook/workspace/chat/chat";
import SourcesPanel from "./sources-panel";
import AIFeaturesPanel from "./ai-features-panel";
import WorkspaceHeader from "./workspace-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div
          className={`${
            showSources ? "flex-[1]" : "hidden"
          } min-w-0 overflow-hidden transition-all duration-300 border-r border-border/50 bg-background/80 backdrop-blur-sm shadow-[2px_0_12px_rgba(0,0,0,0.03)]`}
        >
          <SourcesPanel notebookId={notebookId} />
        </div>

        {/* Chat Panel - Center */}
        <div className="flex-[2] min-w-0 overflow-hidden bg-background shadow-[inset_0_0_30px_rgba(0,0,0,0.02)] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/3 pointer-events-none" />
          <Chat notebookId={notebookId} accessToken={accessToken} />
        </div>

        {/* AI Features Panel - Right */}
        <div
          className={`${
            showAIFeatures ? "flex-[1]" : "hidden"
          } min-w-0 overflow-hidden transition-all duration-300 border-l border-border/50 bg-background/80 backdrop-blur-sm shadow-[-2px_0_12px_rgba(0,0,0,0.03)]`}
        >
          <AIFeaturesPanel notebookId={notebookId} />
        </div>
      </div>
    </div>
  );
}
