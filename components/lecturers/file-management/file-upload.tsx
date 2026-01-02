"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import examApi from "@/api/client/exam";

interface FileUploadProps {
  notebookId: string;
  onUploadSuccess: () => void;
  onClose: () => void;
}

export default function FileUpload({
  notebookId,
  onUploadSuccess,
  onClose,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    const validFiles = selectedFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} không được hỗ trợ`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`File ${file.name} quá lớn (tối đa 10MB)`);
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Vui lòng chọn ít nhất một file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedFiles = await examApi.uploadFilesSimple(notebookId, files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success(`Đã upload thành công ${uploadedFiles.length} file(s)`);
      onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading files:", error);
      const errorMessage = error.response?.data?.message || "Không thể upload files";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return <FileText className="size-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Upload Files</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn files để upload vào notebook
            </p>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
          >
            Chọn files
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Hỗ trợ: PDF, Word, PowerPoint, Text files (tối đa 10MB mỗi file)
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Files đã chọn ({files.length})</h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Đang upload...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Lưu ý quan trọng:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Files sẽ được xử lý tự động bằng OCR và tạo embedding</li>
              <li>• Quá trình xử lý có thể mất vài phút tùy kích thước file</li>
              <li>• Chỉ files có trạng thái "Sẵn sàng" mới có thể dùng tạo câu hỏi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Hủy
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? "Đang upload..." : `Upload ${files.length} file(s)`}
        </Button>
      </div>
    </div>
  );
}