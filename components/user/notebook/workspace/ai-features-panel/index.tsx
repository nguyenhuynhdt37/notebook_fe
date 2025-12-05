"use client";

import { FileText, Mic, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewTab from "./overview-tab";
import PodcastTab from "./podcast-tab";
import FilesTab from "./files-tab";

interface AIFeaturesPanelProps {
  notebookId: string;
}

export default function AIFeaturesPanel({ notebookId }: AIFeaturesPanelProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-muted/5">
      <div className="border-b border-border/60 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 px-4 py-4 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 shadow-sm border border-border/30">
            <Sparkles className="size-4 text-foreground" />
          </div>
          <h2 className="font-semibold text-base text-foreground">
            Tính năng AI
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-muted/10 px-4 py-2.5 shrink-0">
            <TabsList className="w-full justify-start bg-transparent gap-1">
              <TabsTrigger
                value="overview"
                className="gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/60 transition-all"
              >
                <Sparkles className="size-3.5" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger
                value="podcast"
                className="gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/60 transition-all"
              >
                <Mic className="size-3.5" />
                Podcast
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="gap-1.5 text-xs px-3 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/60 transition-all"
              >
                <FileText className="size-3.5" />
                Tệp đã tạo
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="overview"
            className="flex-1 m-0 p-4 overflow-y-auto"
          >
            <OverviewTab />
          </TabsContent>

          <TabsContent
            value="podcast"
            className="flex-1 m-0 p-4 overflow-y-auto"
          >
            <PodcastTab />
          </TabsContent>

          <TabsContent value="files" className="flex-1 m-0 p-4 overflow-y-auto">
            <FilesTab notebookId={notebookId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
