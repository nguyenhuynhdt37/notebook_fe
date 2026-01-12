"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Info, LayoutDashboard } from "lucide-react";
import { useUserStore } from "@/stores/user";
import Link from "next/link";
import api from "@/api/client/axios";
import RegulationFileList from "./regulation-file-list";
import RegulationChatPanel from "./regulation-chat-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { NotebookInfo } from "@/types/user/regulation-chat";
import { cn } from "@/lib/utils";

export default function RegulationChat() {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [notebookInfo, setNotebookInfo] = useState<NotebookInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [fileListCollapsed, setFileListCollapsed] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    loadNotebookInfo();
  }, []);

  const loadNotebookInfo = async () => {
    try {
      const response = await api.get<{ data: NotebookInfo }>(
        "/user/regulation/notebook"
      );
      setNotebookInfo(response.data.data);
    } catch (error) {
      console.error("Error loading notebook info:", error);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Hero Header */}
      <div className="border-b bg-gradient-to-b from-muted/50 to-background flex-shrink-0">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-3">
            {isLoadingInfo ? (
              <>
                <Skeleton className="h-9 w-96" />
                <Skeleton className="h-5 w-2/3" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {notebookInfo?.title || "Hỏi đáp Quy chế & Công văn"}
                  </h1>
                  {notebookInfo?.totalFiles !== undefined && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary">
                      <FileText className="size-4" />
                      <span className="text-sm font-medium">
                        {notebookInfo.totalFiles} tài liệu
                      </span>
                    </div>
                  )}
                  {notebookInfo?.description && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetailModal(true)}
                    >
                      <Info className="size-4 mr-1.5" />
                      Xem chi tiết
                    </Button>
                  )}
                  {user && (
                    <Link href="/" passHref>
                      <Button variant="ghost" size="sm">
                        <LayoutDashboard className="size-4 mr-1.5" />
                        Trang chủ
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Full Height */}
      <div className="flex-1 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-6 py-6 h-full">
          <div
            className={cn(
              "grid gap-0 h-full transition-all duration-300",
              fileListCollapsed
                ? "lg:grid-cols-[48px_1fr]"
                : "lg:grid-cols-[320px_1fr]"
            )}
          >
            {/* Sidebar - File List */}
            <Card
              className={cn(
                "overflow-hidden h-full flex flex-col",
                fileListCollapsed
                  ? "rounded-r-none border-r-0"
                  : "rounded-r-none border-r-0"
              )}
            >
              <RegulationFileList
                selectedFileIds={selectedFileIds}
                onSelectionChange={setSelectedFileIds}
                collapsed={fileListCollapsed}
                onCollapsedChange={setFileListCollapsed}
              />
            </Card>

            {/* Main - Chat Panel */}
            <Card
              className={cn(
                "overflow-hidden h-full flex flex-col",
                fileListCollapsed ? "rounded-l-none border-l" : "rounded-l-none border-l"
              )}
            >
              <RegulationChatPanel selectedFileIds={selectedFileIds} />
            </Card>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {notebookInfo?.title || "Thông tin chi tiết"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {notebookInfo?.description ? (
              <MarkdownRenderer
                content={notebookInfo.description}
                className="prose prose-sm dark:prose-invert max-w-none"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có mô tả chi tiết
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
