"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface DateTimePreviewProps {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
}

export function DateTimePreview({ startDate, endDate, startTime, endTime }: DateTimePreviewProps) {
  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    // Create new date in local timezone
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
    return combined;
  };

  const startDateTime = combineDateTime(startDate, startTime);
  const endDateTime = combineDateTime(endDate, endTime);
  const now = new Date();
  
  // Calculate duration
  const durationMs = endDateTime.getTime() - startDateTime.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="p-3 bg-muted/50 rounded-lg border">
      <p className="text-sm font-medium text-muted-foreground mb-2">Thời gian thi:</p>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium">Bắt đầu:</span> {format(startDateTime, "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
        </p>
        <p className="text-sm">
          <span className="font-medium">Kết thúc:</span> {format(endDateTime, "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Thời lượng:</span> {durationHours > 0 && `${durationHours} giờ `}{durationMinutes} phút
        </p>
        {startDateTime <= now && (
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Thời gian bắt đầu phải trong tương lai
          </p>
        )}
        {endDateTime <= startDateTime && (
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Thời gian kết thúc phải sau thời gian bắt đầu
          </p>
        )}
      </div>
    </div>
  );
}