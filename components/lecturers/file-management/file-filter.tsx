"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileFilterProps {
  search: string;
  status: string;
  mimeType: string;
  ocrDone: string;
  embeddingDone: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onMimeTypeChange: (value: string) => void;
  onOcrDoneChange: (value: string) => void;
  onEmbeddingDoneChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function FileFilter({
  search,
  status,
  mimeType,
  ocrDone,
  embeddingDone,
  sortBy,
  onSearchChange,
  onStatusChange,
  onMimeTypeChange,
  onOcrDoneChange,
  onEmbeddingDoneChange,
  onSortChange,
}: FileFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm theo tên file..."
          className="w-64 pl-9 h-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={status || "ALL"} onValueChange={onStatusChange}>
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          <SelectItem value="pending">Chờ xử lý</SelectItem>
          <SelectItem value="processing">Đang xử lý</SelectItem>
          <SelectItem value="done">Hoàn thành</SelectItem>
          <SelectItem value="failed">Lỗi</SelectItem>
        </SelectContent>
      </Select>
      <Select value={mimeType || "ALL"} onValueChange={onMimeTypeChange}>
        <SelectTrigger className="w-44 h-9">
          <SelectValue placeholder="Loại file" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả loại</SelectItem>
          <SelectItem value="application/pdf">PDF</SelectItem>
          <SelectItem value="application/msword">Word (.doc)</SelectItem>
          <SelectItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
            Word (.docx)
          </SelectItem>
          <SelectItem value="application/vnd.openxmlformats-officedocument.presentationml.presentation">
            PowerPoint (.pptx)
          </SelectItem>
          <SelectItem value="text/plain">Text (.txt)</SelectItem>
        </SelectContent>
      </Select>
      <Select value={ocrDone || "ALL"} onValueChange={onOcrDoneChange}>
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="OCR" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả OCR</SelectItem>
          <SelectItem value="true">Đã OCR</SelectItem>
          <SelectItem value="false">Chưa OCR</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={embeddingDone || "ALL"}
        onValueChange={onEmbeddingDoneChange}
      >
        <SelectTrigger className="w-40 h-9">
          <SelectValue placeholder="Embedding" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tất cả Embedding</SelectItem>
          <SelectItem value="true">Đã Embedding</SelectItem>
          <SelectItem value="false">Chưa Embedding</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sortBy || "createdAt"} onValueChange={onSortChange}>
        <SelectTrigger className="w-48 h-9">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Ngày tạo (mới nhất)</SelectItem>
          <SelectItem value="createdAtAsc">Ngày tạo (cũ nhất)</SelectItem>
          <SelectItem value="originalFilename">Tên file (A-Z)</SelectItem>
          <SelectItem value="originalFilenameDesc">Tên file (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}