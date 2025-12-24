"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/client/axios";
import { RegulationConversation } from "@/types/user/regulation-chat";

interface NewChatButtonProps {
  onCreated: (conversationId: string) => void;
}

export default function NewChatButton({ onCreated }: NewChatButtonProps) {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);
      const response = await api.post<RegulationConversation>(
        "/user/regulation/chat/conversations?title=Cuộc%20trò%20chuyện%20mới"
      );
      const newConversation = response.data;

      // Refresh list
      window.dispatchEvent(new CustomEvent("regulation-chat:refresh"));

      // Notify parent with new conversation ID
      onCreated(newConversation.id);

      // Set active on server
      await api.post(
        `/user/regulation/chat/conversations/${newConversation.id}/active`
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-3 border-b">
      <Button
        size="sm"
        className="w-full"
        onClick={handleCreate}
        disabled={isCreating}
      >
        {isCreating ? (
          <>
            <Loader2 className="size-4 mr-1.5 animate-spin" />
            Đang tạo...
          </>
        ) : (
          <>
            <Plus className="size-4 mr-1.5" />
            Chat mới
          </>
        )}
      </Button>
    </div>
  );
}
