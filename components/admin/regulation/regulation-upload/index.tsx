"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

export default function RegulationFileUpload() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chunkSize, setChunkSize] = useState(800);
  const [chunkOverlap, setChunkOverlap] = useState(120);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isPdf = file.type === "application/pdf";
      const isDocx =
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      return isPdf || isDocx;
    });

    if (validFiles.length !== files.length) {
      toast.error("Chỉ chấp nhận file PDF hoặc DOCX");
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn file để upload");
      return;
    }

    if (chunkSize < 500 || chunkSize > 2000) {
      toast.error("Chunk size phải từ 500 đến 2000");
      return;
    }

    if (chunkOverlap < 50 || chunkOverlap > 400) {
      toast.error("Chunk overlap phải từ 50 đến 400");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("chunkSize", chunkSize.toString());
      formData.append("chunkOverlap", chunkOverlap.toString());

      await api.post("/admin/regulation/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success(`Upload thành công ${selectedFiles.length} file`);
      router.push("/admin/regulation");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Không thể upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 hover:bg-transparent -ml-2"
            onClick={() => router.push("/admin/regulation")}
          >
            <ChevronLeft className="size-4 mr-1" />
            Quay lại
          </Button>
        </div>
        <CardTitle className="text-xl">Chọn file upload</CardTitle>
        <CardDescription className="mt-1.5">
          Chọn file PDF hoặc DOCX và cấu hình chunk settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="files">Chọn file (PDF, DOCX)</Label>
            <Input
              ref={fileInputRef}
              id="files"
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Bạn có thể chọn nhiều file cùng lúc
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>File đã chọn ({selectedFiles.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted"
                  >
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-6 w-6"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chunkSize">Chunk Size (500-2000)</Label>
              <Input
                id="chunkSize"
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                min={500}
                max={2000}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Kích thước mỗi chunk text
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chunkOverlap">Chunk Overlap (50-400)</Label>
              <Input
                id="chunkOverlap"
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                min={50}
                max={400}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                Độ chồng lấp giữa các chunk
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Đang upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            onClick={() => router.push("/admin/regulation")}
            variant="outline"
            disabled={isUploading}
          >
            <X className="size-4" />
            Hủy
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
          >
            <Upload className="size-4" />
            {isUploading ? "Đang upload..." : "Upload"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
