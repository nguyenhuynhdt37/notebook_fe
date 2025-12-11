"use client";

import GroupChat from "./chat_message/group-chat";
import Chatbot from "./chatbot";

interface ChatProps {
  notebookId: string;
  accessToken?: string;
  selectedFileIds?: string[];
  chatMode: "chatbot" | "group";
}

export default function Chat({
  notebookId,
  accessToken,
  selectedFileIds = [],
  chatMode,
}: ChatProps) {
  return (
    <div className="flex flex-col h-full bg-background relative">
      {chatMode === "group" ? (
        <GroupChat notebookId={notebookId} accessToken={accessToken} />
      ) : (
        <Chatbot notebookId={notebookId} selectedFileIds={selectedFileIds} />
      )}
    </div>
  );
}
