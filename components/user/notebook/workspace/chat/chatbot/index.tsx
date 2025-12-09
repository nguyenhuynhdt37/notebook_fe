"use client";

import { useState, useRef, useEffect } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user";
import api from "@/api/client/axios";
import { ChatConversation } from "@/types/user/chatbot";
import MessageList from "./message-list";
import ChatInput from "./input";
import HistorySidebar from "./history-sidebar";

interface ChatbotProps {
  notebookId: string;
  selectedFileIds?: string[];
}

export default function Chatbot({
  notebookId,
  selectedFileIds = [],
}: ChatbotProps) {
  const user = useUserStore((state) => state.user);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hasLoadedActiveRef = useRef(false);

  // Load active conversation on mount
  useEffect(() => {
    if (hasLoadedActiveRef.current) return;

    const loadActiveConversation = async () => {
      try {
        hasLoadedActiveRef.current = true;
        setIsLoadingActive(true);
        const response = await api.get<ChatConversation>(
          `/user/notebooks/${notebookId}/bot-chat/conversations/active`,
          {
            validateStatus: (status) => status === 200 || status === 204,
          }
        );

        // 200 OK: có active conversation
        if (response.status === 200 && response.data?.id) {
          setSelectedConversationId(response.data.id);
        }
        // 204 No Content: không có active conversation, để HistoryList tự xử lý
      } catch (error: any) {
        console.error("Error loading active conversation:", error);
        // Nếu lỗi, để HistoryList tự xử lý
      } finally {
        setIsLoadingActive(false);
      }
    };

    loadActiveConversation();
  }, [notebookId]);

  // Click outside to close sidebar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        isHistoryOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-history-btn]")
      ) {
        setIsHistoryOpen(false);
      }
    };

    if (isHistoryOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isHistoryOpen]);

  // Listen for conversation created event
  useEffect(() => {
    const handleConversationCreated = (e: CustomEvent<string>) => {
      setSelectedConversationId(e.detail);
    };

    window.addEventListener(
      "chatbot:conversation-created",
      handleConversationCreated as EventListener
    );

    return () => {
      window.removeEventListener(
        "chatbot:conversation-created",
        handleConversationCreated as EventListener
      );
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-br from-background via-muted/30 to-background px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-sm backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3.5">
          <div>
            <h3 className="font-semibold text-base text-foreground leading-tight tracking-tight">
              Chatbot AI
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hỏi về tài liệu trong notebook
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 hover:bg-muted/60 transition-colors"
          data-history-btn
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <History className="size-4.5" />
        </Button>
      </div>

      {/* History Sidebar */}
      <HistorySidebar
        ref={sidebarRef}
        notebookId={notebookId}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onClearSelection={() => setSelectedConversationId(null)}
        isLoadingActive={isLoadingActive}
        onConversationCreated={() => {
          // Trigger refresh by dispatching event
          window.dispatchEvent(
            new CustomEvent("chatbot:refresh-conversations")
          );
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList
          notebookId={notebookId}
          selectedConversationId={selectedConversationId}
          selectedFileIds={selectedFileIds}
          user={user}
        />

        <ChatInput
          notebookId={notebookId}
          selectedFileIds={selectedFileIds}
          selectedConversationId={selectedConversationId}
        />
      </div>
    </div>
  );
}
