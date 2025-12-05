"use client";

import { MessageSquare, Bot } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GroupChat from "./group-chat";
import Chatbot from "./chatbot";

interface ChatProps {
  notebookId: string;
  accessToken?: string;
}

export default function Chat({ notebookId, accessToken }: ChatProps) {
  return (
    <div className="flex flex-col h-full bg-background relative">
      <Tabs defaultValue="group" className="h-full flex flex-col">
        <div className="border-b border-border/60 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 px-4 sm:px-6 py-3.5 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-sm relative z-10">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-1">
            <TabsTrigger
              value="group"
              className="gap-2 text-sm px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/60 transition-all"
            >
              <MessageSquare className="size-4" />
              Chat hội đồng
            </TabsTrigger>
            <TabsTrigger
              value="chatbot"
              className="gap-2 text-sm px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/60 transition-all"
            >
              <Bot className="size-4" />
              Chatbot
            </TabsTrigger>
          </TabsList>
      </div>

        <TabsContent value="group" className="flex-1 m-0 overflow-hidden">
          <GroupChat notebookId={notebookId} accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="chatbot" className="flex-1 m-0 overflow-hidden">
          <Chatbot notebookId={notebookId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
