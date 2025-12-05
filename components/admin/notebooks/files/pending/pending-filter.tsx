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
import NotebookFilter from "./notebook-filter";
import ContributorFilterPending from "./contributor-filter-pending";

interface PendingFilterProps {
  search: string;
  notebookId: string;
  mimeType: string;
  uploadedBy: string;
  sortBy: string;
  onSearchChange: (value: string) => void;
  onNotebookIdChange: (value: string) => void;
  onMimeTypeChange: (value: string) => void;
  onUploadedByChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function PendingFilter({
  search,
  notebookId,
  mimeType,
  uploadedBy,
  sortBy,
  onSearchChange,
  onNotebookIdChange,
  onMimeTypeChange,
  onUploadedByChange,
  onSortChange,
}: PendingFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm theo tên file..."
          className="w-64 pl-9 h-9"
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <NotebookFilter value={notebookId} onChange={onNotebookIdChange} />
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
        </SelectContent>
      </Select>
      <ContributorFilterPending
        notebookId={notebookId && notebookId !== "ALL" ? notebookId : undefined}
        value={uploadedBy}
        onChange={onUploadedByChange}
      />
      <Select value={sortBy || "createdAt"} onValueChange={onSortChange}>
        <SelectTrigger className="w-48 h-9">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Ngày tạo (mới nhất)</SelectItem>
          <SelectItem value="createdAtAsc">Ngày tạo (cũ nhất)</SelectItem>
          <SelectItem value="updatedAt">Ngày cập nhật (mới nhất)</SelectItem>
          <SelectItem value="updatedAtAsc">Ngày cập nhật (cũ nhất)</SelectItem>
          <SelectItem value="originalFilename">Tên file (A-Z)</SelectItem>
          <SelectItem value="originalFilenameDesc">Tên file (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
