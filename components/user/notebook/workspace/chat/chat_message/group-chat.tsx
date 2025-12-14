"use client";

import { useState } from "react";
import { MessageSquare, Users, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useWebSocketChat } from "@/hooks/websocket/use-websocket-chat";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import { TypingNotification } from "@/types/chat/message";
import { toast } from "sonner";

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
    onError: (error) => toast.error(error.message || "Lỗi kết nối chat"),
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

  const getTypingText = (users: TypingNotification[]) => {
    if (users.length === 0) return null;
    if (users.length === 1) return `${users[0].user.fullName} đang gõ...`;
    if (users.length === 2)
      return `${users[0].user.fullName} và ${users[1].user.fullName} đang gõ...`;
    return `${users.length} người đang gõ...`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <MessageSquare className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Chat nhóm</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`size-2 rounded-full ${
                          isConnected ? "bg-green-500" : "bg-muted-foreground"
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {isConnected ? "Đã kết nối" : "Đang kết nối..."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  <span>
                    {isConnected
                      ? `${onlineUsers.length} online`
                      : "Đang kết nối..."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <HelpCircle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Hướng dẫn</p>
                  <p>• Hover tin nhắn để reply/react</p>
                  <p>• Enter để gửi, Shift+Enter xuống dòng</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        onReply={handleReply}
        onReact={(messageId, emoji) => reactToMessage(messageId, emoji)}
        onLoadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        onlineUsers={onlineUsers}
      />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground">
              {getTypingText(typingUsers)}
            </p>
          </div>
        </div>
      )}

      {/* Input */}
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
