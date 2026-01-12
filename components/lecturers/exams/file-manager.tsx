"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Trash2, Check, File, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import examApi from "@/api/client/exam";
import { NotebookFile } from "@/types/lecturer/exam";

interface FileManagerProps {
  notebookId: string;
  files: NotebookFile[];
  selectedFiles: string[];
  onFilesChange: (files: NotebookFile[]) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowSelection?: boolean;
}

export function FileManager({
  notebookId,
  files,
  selectedFiles,
  onFilesChange,
  onSelectionChange,
  allowUpload = true,
  allowDelete = true,
  allowSelection = true,
}: FileManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (!notebookId || pendingFiles.length === 0) {
      toast.error("Vui lòng chọn files để upload");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFiles = await examApi.uploadFilesSimple(notebookId, pendingFiles);
      onFilesChange([...files, ...uploadedFiles]);
      setPendingFiles([]);
      toast.success(`Đã upload ${uploadedFiles.length} file(s)`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await examApi.deleteFile(notebookId, fileId);
      onFilesChange(files.filter(f => f.id !== fileId));
      if (selectedFiles.includes(fileId)) {
        onSelectionChange(selectedFiles.filter(id => id !== fileId));
      }
      toast.success('Đã xóa file');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa file");
    }
  };

  const handleFileToggle = (fileId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedFiles, fileId]);
    } else {
      onSelectionChange(selectedFiles.filter(id => id !== fileId));
    }
  };

  const handleSelectAll = () => {
    const readyFileIds = readyFiles.map(f => f.id);
    if (selectedFiles.length === readyFileIds.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(readyFileIds);
    }
  };

  const readyFiles = files.filter(file => 
    file.status === "done" && file.ocrDone && file.embeddingDone
  );

  const getFileIcon = (mimeType: string) => {
    const type = mimeType.split('/')[1]?.toUpperCase() || 'FILE';
    return type;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {allowUpload && (
        <div className="rounded-lg border border-dashed p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Upload Files Mới</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Chọn files
            </Button>
            {pendingFiles.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleUploadFiles}
                disabled={isUploading}
              >
                {isUploading ? "Đang upload..." : `Upload (${pendingFiles.length})`}
              </Button>
            )}
          </div>

          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs bg-muted px-2 py-1 rounded">
                  <File className="h-3 w-3" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removePendingFile(index)}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Hỗ trợ: PDF, Word, PowerPoint, Text files. Files sẽ được xử lý tự động bằng AI.
          </p>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Danh sách Files ({readyFiles.length} sẵn sàng / {files.length} tổng)
            </span>
          </div>
          {allowSelection && readyFiles.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-7 text-xs">
              {selectedFiles.length === readyFiles.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Chưa có file nào
          </div>
        ) : readyFiles.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Đang xử lý files... Vui lòng chờ
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {readyFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer
                  ${selectedFiles.includes(file.id) 
                    ? 'border-foreground/30 bg-accent' 
                    : 'hover:bg-muted/50'}`}
                onClick={() => allowSelection && handleFileToggle(file.id, !selectedFiles.includes(file.id))}
              >
                {allowSelection && (
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) => handleFileToggle(file.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {getFileIcon(file.mimeType)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.originalFilename}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{(file.fileSize / 1024).toFixed(0)} KB</span>
                    <span>•</span>
                    <span>{new Date(file.createdAt).toLocaleDateString("vi-VN")}</span>
                    {file.chunksCount && (
                      <>
                        <span>•</span>
                        <span>{file.chunksCount} chunks</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px] h-5 text-green-600 border-green-200">
                    <Check className="h-2.5 w-2.5 mr-0.5" />
                    Sẵn sàng
                  </Badge>
                  
                  {allowDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="h-7 w-7 text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {allowSelection && selectedFiles.length > 0 && (
          <div className="pt-2 border-t">
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Đã chọn {selectedFiles.length} file
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}