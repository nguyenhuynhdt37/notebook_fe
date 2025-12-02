"use client";

import { Download, FileText, ExternalLink } from "lucide-react";
import { NotebookFileResponse } from "@/types/admin/notebook-file";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FilePreviewDialogProps {
  file: NotebookFileResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: FilePreviewDialogProps) {
  const handleDownload = () => {
    if (file?.storageUrl) {
      window.open(file.storageUrl, "_blank");
    }
  };

  const isPdf = file?.mimeType === "application/pdf";
  const isWord =
    file?.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file?.mimeType === "application/msword";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl truncate">
                {file?.originalFilename || "Xem trước file"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {file
                  ? `${file.mimeType} • ${Math.round((file.fileSize / 1024) * 100) / 100} KB`
                  : ""}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (file?.storageUrl) {
                    window.open(file.storageUrl, "_blank");
                  }
                }}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="size-4 mr-2" />
                Mở trong tab mới
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Tải xuống
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto px-6 py-4">
          {file ? (
            <>
              {isPdf ? (
                <div className="w-full border rounded-lg overflow-hidden bg-muted/50">
                  <object
                    data={file.storageUrl}
                    type="application/pdf"
                    className="w-full h-[calc(90vh-200px)] min-h-[600px]"
                  >
                    <div className="flex items-center justify-center h-full p-6">
                      <div className="text-center">
                        <FileText className="size-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-2">
                          Không thể hiển thị file PDF
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Vui lòng tải xuống để xem nội dung
                        </p>
                        <Button onClick={handleDownload} variant="outline">
                          <Download className="size-4 mr-2" />
                          Tải xuống file
                        </Button>
                      </div>
                    </div>
                  </object>
                </div>
              ) : isWord ? (
                <div className="w-full border rounded-lg overflow-hidden bg-background">
                  <div className="p-6">
                    <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                      <FileText className="size-12" />
                      <div className="text-center">
                        <p className="font-medium mb-1">
                          Không thể xem trước file Word
                        </p>
                        <p className="text-sm">
                          Vui lòng tải xuống để xem nội dung
                        </p>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="mt-4"
                        >
                          <Download className="size-4 mr-2" />
                          Tải xuống file
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full border rounded-lg overflow-hidden bg-muted/50">
                  <div className="p-6">
                    <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                      <FileText className="size-12" />
                      <div className="text-center">
                        <p className="font-medium mb-1">
                          Không hỗ trợ xem trước loại file này
                        </p>
                        <p className="text-sm">
                          Vui lòng tải xuống để xem nội dung
                        </p>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="mt-4"
                        >
                          <Download className="size-4 mr-2" />
                          Tải xuống file
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy file
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

