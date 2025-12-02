"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useWebSocketChat } from "@/hooks/use-websocket-chat";
import MessageList from "./message-list";
import ChatInput from "./chat-input";
import { TypingNotification } from "@/types/chat/message";
import { toast } from "sonner";

interface ChatProps {
    notebookId: string;
}

export default function Chat({ notebookId }: ChatProps) {
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
        <div className="flex flex-col h-full bg-background max-w-7xl mx-auto">
            <div className="border-b p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-semibold text-lg">Chat</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div
                                className={`size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"
                                    }`}
                            />
                            <p className="text-xs text-muted-foreground">
                                {isConnected
                                    ? `${onlineUsers.length} người online`
                                    : "Đang kết nối..."}
                            </p>
                        </div>
                    </div>
                </div>
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

