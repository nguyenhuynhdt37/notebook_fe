"use client";

import { useState } from "react";
import { MessageSquare, HelpCircle, Users } from "lucide-react";
import { useWebSocketChat } from "@/hooks/websocket/use-websocket-chat";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import { TypingNotification } from "@/types/chat/message";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GroupChatProps {
  notebookId: string;
  accessToken?: string;
}

export default function GroupChat({ notebookId, accessToken }: GroupChatProps) {
  const [replyToMessage, setReplyToMessage] = useState<{
    id: string;
    content: string;
    userName: string;
  } | null>(null);

  const {
    messages,
    isConnected,
    isLoading,
    typingUsers,
    onlineUsers,
    hasMore,
    sendMessage,
    reactToMessage,
    sendTyping,
    loadMore,
  } = useWebSocketChat({
    notebookId,
    accessToken,
    onError: (error) => {
      toast.error(error.message || "Lỗi kết nối chat");
    },
  });

  const handleSend = (content: string, replyToMessageId?: string | null) => {
    sendMessage(content, replyToMessageId);
    setReplyToMessage(null);
  };

  const handleReply = (message: {
    id: string;
    content: string;
    user: { fullName: string } | null;
  }) => {
    setReplyToMessage({
      id: message.id,
      content: message.content,
      userName: message.user?.fullName || "Người dùng",
    });
  };

  const handleReact = (messageId: string, emoji: string) => {
    reactToMessage(messageId, emoji);
  };

  const getTypingText = (users: TypingNotification[]) => {
    if (users.length === 0) return null;
    if (users.length === 1) {
      return `${users[0].user.fullName} đang gõ...`;
    }
    if (users.length === 2) {
      return `${users[0].user.fullName} và ${users[1].user.fullName} đang gõ...`;
    }
    return `${users.length} người đang gõ...`;
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="border-b border-border/60 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 shadow-sm border border-border/30">
            <MessageSquare className="size-4.5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-foreground leading-tight">
              Chat hội đồng
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`size-2 rounded-full transition-all cursor-help ${
                        isConnected
                          ? "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"
                          : "bg-muted-foreground"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isConnected
                        ? "Đã kết nối - Chat real-time"
                        : "Đang kết nối..."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center gap-1.5">
                <Users className="size-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">
                  {isConnected
                    ? `${onlineUsers.length} người online`
                    : "Đang kết nối..."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                <HelpCircle className="size-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs space-y-1">
                <p className="font-medium mb-1">Hướng dẫn Chat</p>
                <p>• Click vào tin nhắn để trả lời</p>
                <p>• Hover để xem các tùy chọn</p>
                <p>• Chat real-time với nhóm</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <MessageList
        messages={messages}
        onReply={handleReply}
        onReact={handleReact}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        onlineUsers={onlineUsers}
      />

      {typingUsers.length > 0 && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <p className="text-sm text-muted-foreground">
            {getTypingText(typingUsers)}
          </p>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        onTyping={sendTyping}
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        disabled={!isConnected}
      />
    </div>
  );
}
