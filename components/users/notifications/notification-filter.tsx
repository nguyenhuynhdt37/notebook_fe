"use client";

import { Bell, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NotificationFilterProps {
  isRead: boolean | null;
  type: string | null;
  onIsReadChange: (value: boolean | null) => void;
  onTypeChange: (value: string | null) => void;
}

export default function NotificationFilter({
  isRead,
  type,
  onIsReadChange,
  onTypeChange,
}: NotificationFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Lọc:</span>
      </div>

      <Select
        value={isRead === null ? "all" : isRead ? "read" : "unread"}
        onValueChange={(value) => {
          if (value === "all") onIsReadChange(null);
          else if (value === "read") onIsReadChange(true);
          else onIsReadChange(false);
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="unread">Chưa đọc</SelectItem>
          <SelectItem value="read">Đã đọc</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={type || "all"}
        onValueChange={(value) => onTypeChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả loại</SelectItem>
          <SelectItem value="chat_message">Tin nhắn</SelectItem>
          <SelectItem value="announcement">Thông báo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

