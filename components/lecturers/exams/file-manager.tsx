"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      // Use simple upload as recommended
      const uploadedFiles = await examApi.uploadFilesSimple(notebookId, pendingFiles);
      
      // Add uploaded files to the list
      const updatedFiles = [...files, ...uploadedFiles];
      onFilesChange(updatedFiles);
      setPendingFiles([]);
      
      toast.success(`Đã upload thành công ${uploadedFiles.length} file(s)`);
    } catch (error: any) {
      console.error("Error uploading files:", error);
      const errorMessage = error.response?.data?.message || "Không thể upload files";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await examApi.deleteFile(notebookId, fileId);
      const updatedFiles = files.filter(f => f.id !== fileId);
      onFilesChange(updatedFiles);
      
      // Remove from selection if selected
      if (selectedFiles.includes(fileId)) {
        onSelectionChange(selectedFiles.filter(id => id !== fileId));
      }
      
      toast.success('Đã xóa file');
    } catch (error: any) {
      console.error("Error deleting file:", error);
      const errorMessage = error.response?.data?.message || "Không thể xóa file";
      toast.error(errorMessage);
    }
  };

  const handleFileToggle = (fileId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedFiles, fileId]);
    } else {
      onSelectionChange(selectedFiles.filter(id => id !== fileId));
    }
  };

  const readyFiles = files.filter(file => 
    file.status === "done" && file.ocrDone && file.embeddingDone
  );

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {allowUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Upload Files Mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Chọn files
              </Button>
              {pendingFiles.length > 0 && (
                <Button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={isUploading}
                >
                  {isUploading ? "Đang upload..." : `Upload ${pendingFiles.length} file(s)`}
                </Button>
              )}
            </div>

            {pendingFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Files chờ upload:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pendingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePendingFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Hỗ trợ: PDF, Word, PowerPoint, Text files. Files sẽ được xử lý tự động bằng AI.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Danh sách Files ({readyFiles.length} sẵn sàng / {files.length} tổng)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Chưa có file nào</div>
            </div>
          ) : readyFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Không có file nào sẵn sàng (cần hoàn thành OCR và embedding)
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {readyFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  {allowSelection && (
                    <Checkbox
                      id={file.id}
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={(checked) => 
                        handleFileToggle(file.id, checked as boolean)
                      }
                    />
                  )}
                  
                  <div className="flex-1">
                    <Label 
                      htmlFor={file.id} 
                      className={`font-medium ${allowSelection ? 'cursor-pointer' : ''}`}
                    >
                      {file.originalFilename}
                    </Label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span>•</span>
                      <span>{file.uploadedBy.fullName}</span>
                      {file.chunksCount && (
                        <>
                          <span>•</span>
                          <span>{file.chunksCount} chunks</span>
                        </>
                      )}
                    </div>
                    {file.contentPreview && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {file.contentPreview.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {file.mimeType.split('/')[1]?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-green-600">
                      Sẵn sàng
                    </Badge>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {allowDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          title="Xóa file"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {allowSelection && selectedFiles.length > 0 && (
            <div className="pt-3 border-t mt-3">
              <Badge variant="secondary">
                Đã chọn {selectedFiles.length} file
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}