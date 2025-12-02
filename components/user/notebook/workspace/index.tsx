"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Chat from "@/components/chat/chat";
import { Card, CardContent } from "@/components/ui/card";

interface NotebookWorkspaceProps {
    notebookId: string;
}

export default function NotebookWorkspace({
    notebookId,
}: NotebookWorkspaceProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("chat");

    return (
        <div className="h-screen flex flex-col bg-background">
            <div className="border-b px-4 sm:px-6 lg:px-8 py-1 flex items-center gap-4 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold">Workspace</h1>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="h-full flex flex-col"
                >
                    <div className="border-b px-4 sm:px-6 lg:px-8 shrink-0">
                        <TabsList>
                            <TabsTrigger value="chat" className="gap-2">
                                <MessageSquare className="size-4" />
                                Chat
                            </TabsTrigger>
                            <TabsTrigger value="ai" className="gap-2">
                                <Sparkles className="size-4" />
                                AI
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="chat" className="flex-1 m-0 p-0 overflow-hidden">
                        <div className="h-full">
                            <Chat notebookId={notebookId} />
                        </div>
                    </TabsContent>

                    <TabsContent value="ai" className="flex-1 m-0 p-4 sm:p-6 lg:p-8">
                        <Card className="h-full">
                            <CardContent className="flex items-center justify-center h-full">
                                <div className="text-center space-y-4">
                                    <Sparkles className="size-12 text-muted-foreground mx-auto" />
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            Tính năng AI đang phát triển
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Tính năng này sẽ sớm có mặt
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

