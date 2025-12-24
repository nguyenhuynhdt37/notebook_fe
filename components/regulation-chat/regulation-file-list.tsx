"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  RegulationFile,
  RegulationFilesResponse,
} from "@/types/user/regulation-chat";

export default function RegulationFileList({
  selectedFileIds,
  onSelectionChange,
}: {
  selectedFileIds: string[];
  onSelectionChange: (ids: string[]) => void;
}) {
  const [files, setFiles] = useState<RegulationFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ data: RegulationFilesResponse }>(
        "/user/regulation/files?page=0&size=1000"
      );
      const data = response.data.data;
      setFiles(data.items);

      // Auto-select all files on initial load
      if (data.items.length > 0) {
        onSelectionChange(data.items.map((f) => f.id));
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Không thể tải danh sách tài liệu");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.originalFilename.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleToggleFile = (fileId: string) => {
    if (selectedFileIds.includes(fileId)) {
      onSelectionChange(selectedFileIds.filter((id) => id !== fileId));
    } else {
      onSelectionChange([...selectedFileIds, fileId]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredFiles.map((f) => f.id));
    } else {
      onSelectionChange([]);
    }
  };

  const allSelected =
    filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length;
  const someSelected = selectedFileIds.length > 0 && !allSelected;

  return (
    <>
      <CardHeader className="border-b space-y-2 pb-3 flex-shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Danh sách tài liệu</CardTitle>
            {selectedFileIds.length > 0 && (
              <Badge variant="default" className="text-xs">
                {selectedFileIds.length}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {files.length} tài liệu
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className={cn(
                someSelected && "data-[state=checked]:bg-primary/50"
              )}
            />
            <label
              htmlFor="select-all"
              className="text-xs cursor-pointer select-none text-muted-foreground"
            >
              Chọn tất cả
            </label>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-6 text-center space-y-2">
              <p className="text-sm font-medium">
                {search ? "Không tìm thấy tài liệu" : "Chưa có tài liệu nào"}
              </p>
              <p className="text-xs text-muted-foreground">
                {search
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Vui lòng thêm tài liệu từ trang quản trị"}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);

                return (
                  <div
                    key={file.id}
                    className={cn(
                      "p-3 rounded-lg transition-all duration-200 border",
                      isSelected
                        ? "bg-primary/[0.03] border-primary/20 shadow-sm"
                        : "border-transparent hover:border-accent hover:bg-accent/30"
                    )}
                    onClick={() => handleToggleFile(file.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 w-full">
                        <Checkbox
                          id={`file-${file.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleFile(file.id)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <FileText className="size-4 mt-0.5 text-primary flex-shrink-0" />
                        <a
                          href={file.storageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-0 text-left group"
                        >
                          <p className="text-sm font-medium line-clamp-2 leading-tight group-hover:underline break-all">
                            {file.originalFilename}
                          </p>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 pl-8">
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {formatFileSize(file.fileSize)}
                        </Badge>
                        {file.pagesCount && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {file.pagesCount} trang
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </>
  );
}
