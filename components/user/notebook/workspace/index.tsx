"use client";

import { useState } from "react";
import {
  Menu,
  PanelLeftClose,
  PanelRightClose,
  MessageSquare,
  Bot,
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
  const [chatMode, setChatMode] = useState<"chatbot" | "group">("chatbot");

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkspaceHeader
        leftContent={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setChatMode(chatMode === "chatbot" ? "group" : "chatbot")
                  }
                  className="gap-2 text-sm ml-4"
                >
                  {chatMode === "chatbot" ? (
                    <>
                      <Bot className="size-4" />
                      <span className="hidden sm:inline">Chatbot</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="size-4" />
                      <span className="hidden sm:inline">Chat hội đồng</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Chuyển sang{" "}
                  {chatMode === "chatbot" ? "Chat hội đồng" : "Chatbot"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      >
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

      <div className="flex-1 overflow-hidden flex">
        {/* Sources Panel - Left */}
        {showSources && (
          <div className="flex-1 min-w-0 overflow-hidden border-r border-border/50">
            <SourcesPanel
              notebookId={notebookId}
              onSelectionChange={setSelectedFileIds}
            />
          </div>
        )}

        {/* Chat Panel - Center */}
        <div className="flex-[2] min-w-0 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" />
          <Chat
            notebookId={notebookId}
            accessToken={accessToken}
            selectedFileIds={selectedFileIds}
            chatMode={chatMode}
          />
        </div>

        {/* AI Features Panel - Right */}
        {showAIFeatures && (
          <div className="flex-1 min-w-0 overflow-hidden border-l border-border/50">
            <AIFeaturesPanel
              notebookId={notebookId}
              selectedFileIds={selectedFileIds}
            />
          </div>
        )}
      </div>
    </div>
  );
}
