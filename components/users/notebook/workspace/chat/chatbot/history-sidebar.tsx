"use client";

import { forwardRef, useState } from "react";
import { History, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/api/client/axios";
import { ChatConversation } from "@/types/user/chatbot";
import HistoryList from "./history-list";

interface HistorySidebarProps {
  notebookId: string;
  isOpen: boolean;
  onClose: () => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onClearSelection?: () => void;
  isLoadingActive?: boolean;
  onConversationCreated?: () => void;
}

const HistorySidebar = forwardRef<HTMLDivElement, HistorySidebarProps>(
  (
    {
      notebookId,
      isOpen,
      onClose,
      selectedConversationId,
      onSelectConversation,
      onClearSelection,
      isLoadingActive = false,
      onConversationCreated,
    },
    ref
  ) => {
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
      if (isCreating) return;

      try {
        setIsCreating(true);
        const encodedTitle = encodeURIComponent("New chat");
        const response = await api.post<ChatConversation>(
          `/user/notebooks/${notebookId}/bot-chat/conversations?title=${encodedTitle}`,
          {}
        );

        onSelectConversation(response.data.id);
        onConversationCreated?.();
      } catch (error) {
        console.error("Error creating conversation:", error);
      } finally {
        setIsCreating(false);
      }
    };

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "absolute left-0 top-0 bottom-0 w-80 bg-background border-r border-border/60 z-50 transition-transform duration-300 ease-out flex flex-col",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <History className="size-4.5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Lịch sử chat
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={handleCreate}
                disabled={isCreating}
                title="Tạo chat mới"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={onClose}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* List */}
          <HistoryList
            notebookId={notebookId}
            selectedConversationId={selectedConversationId}
            onSelectConversation={onSelectConversation}
            onClearSelection={onClearSelection}
            isLoadingActive={isLoadingActive}
          />
        </div>
      </>
    );
  }
);

HistorySidebar.displayName = "HistorySidebar";

export default HistorySidebar;
