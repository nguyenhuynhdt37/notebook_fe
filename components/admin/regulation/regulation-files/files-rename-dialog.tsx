"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilesRenameDialogProps {
  fileId: string;
  currentFilename: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: () => void;
}

export default function FilesRenameDialog({
  fileId,
  currentFilename,
  open,
  onOpenChange,
  onRename,
}: FilesRenameDialogProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [baseName, setBaseName] = useState("");

  // Split filename into name and extension
  const getFileNameParts = (filename: string) => {
    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) {
      return { name: filename, extension: "" };
    }
    return {
      name: filename.substring(0, lastDot),
      extension: filename.substring(lastDot),
    };
  };

  const { extension } = getFileNameParts(currentFilename);

  // Reset filename when dialog opens with a new file
  useEffect(() => {
    if (open) {
      const { name } = getFileNameParts(currentFilename);
      setBaseName(name);
    }
  }, [open, currentFilename]);

  const handleRename = async () => {
    const trimmedBaseName = baseName.trim();

    if (!trimmedBaseName) {
      toast.error("Tên file không được để trống");
      return;
    }

    // Combine base name with extension
    const newFilename = trimmedBaseName + extension;

    // Check if filename actually changed
    if (newFilename === currentFilename) {
      onOpenChange(false);
      return;
    }

    setIsRenaming(true);
    try {
      await api.put(`/admin/regulation/files/${fileId}/rename`, {
        newFilename,
      });
      toast.success("Đổi tên file thành công");
      onRename();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error?.response?.data?.message || "Không thể đổi tên file";
      toast.error(errorMessage);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isRenaming) {
      e.preventDefault();
      handleRename();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5" />
            Đổi tên file
          </DialogTitle>
          <DialogDescription>
            Nhập tên mới cho file. Đuôi file ({extension}) sẽ được giữ nguyên.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filename">Tên file mới</Label>
            <div className="flex items-center gap-0">
              <Input
                id="filename"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tên file"
                disabled={isRenaming}
                autoFocus
                className="rounded-r-none"
              />
              <div className="flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                {extension}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRenaming}
          >
            Hủy
          </Button>
          <Button onClick={handleRename} disabled={isRenaming}>
            {isRenaming ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
