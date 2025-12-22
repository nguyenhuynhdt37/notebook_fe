"use client";

import { ClipboardCheck, PlusCircle, Bell, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}

const actions: QuickAction[] = [
  { label: "Điểm danh", icon: ClipboardCheck },
  { label: "Tạo bài tập", icon: PlusCircle },
  { label: "Gửi thông báo", icon: Bell },
  { label: "Chấm điểm", icon: FileEdit },
];

export default function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                className="flex-shrink-0 gap-2 h-10 px-4 hover:bg-foreground hover:text-background transition-all duration-200"
                onClick={action.onClick}
              >
                <Icon className="size-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
