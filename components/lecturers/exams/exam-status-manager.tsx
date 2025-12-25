"use client";

import { useState } from "react";
import { Play, Square, FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { ExamResponse, ExamStatus } from "@/types/lecturer";

interface ExamStatusManagerProps {
  exam: ExamResponse;
  onUpdate: () => void;
}

const statusConfig = {
  DRAFT: { 
    label: "Soạn thảo", 
    color: "bg-gray-100 text-gray-800",
    actions: ["publish", "delete"]
  },
  PUBLISHED: { 
    label: "Đã xuất bản", 
    color: "bg-blue-100 text-blue-800",
    actions: ["activate"]
  },
  ACTIVE: { 
    label: "Đang diễn ra", 
    color: "bg-green-100 text-green-800",
    actions: ["cancel"]
  },
  CANCELLED: { 
    label: "Đã hủy", 
    color: "bg-red-100 text-red-800",
    actions: []
  },
};

const actionConfig = {
  publish: {
    label: "Xuất bản",
    icon: FileCheck,
    variant: "default" as const,
    confirmTitle: "Xuất bản đề thi",
    confirmDescription: "Sau khi xuất bản, bạn sẽ không thể chỉnh sửa nội dung đề thi. Bạn có chắc chắn muốn tiếp tục?",
  },
  activate: {
    label: "Kích hoạt",
    icon: Play,
    variant: "default" as const,
    confirmTitle: "Kích hoạt đề thi",
    confirmDescription: "Sinh viên sẽ có thể bắt đầu làm bài thi. Bạn có chắc chắn muốn kích hoạt?",
  },
  cancel: {
    label: "Dừng thi",
    icon: Square,
    variant: "destructive" as const,
    confirmTitle: "Dừng đề thi",
    confirmDescription: "Tất cả sinh viên đang làm bài sẽ bị dừng lại. Bạn có chắc chắn muốn dừng?",
  },
  delete: {
    label: "Xóa",
    icon: X,
    variant: "destructive" as const,
    confirmTitle: "Xóa đề thi",
    confirmDescription: "Đề thi sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn muốn xóa?",
  },
};

export function ExamStatusManager({ exam, onUpdate }: ExamStatusManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      if (action === "delete") {
        await api.delete(`/api/exams/${exam.id}`);
        toast.success("Đã xóa đề thi");
      } else {
        await api.put(`/api/exams/${exam.id}/${action}`);
        const actionLabels = {
          publish: "xuất bản",
          activate: "kích hoạt", 
          cancel: "dừng",
        };
        toast.success(`Đã ${actionLabels[action as keyof typeof actionLabels]} đề thi`);
      }
      onUpdate();
    } catch (error) {
      console.error(`Error ${action} exam:`, error);
      toast.error(`Không thể thực hiện hành động`);
    } finally {
      setIsLoading(false);
    }
  };

  const status = statusConfig[exam.status];
  const availableActions = status.actions;

  return (
    <div className="flex items-center gap-3">
      <Badge className={status.color}>
        {status.label}
      </Badge>
      
      <div className="flex gap-2">
        {availableActions.map((action) => {
          const config = actionConfig[action as keyof typeof actionConfig];
          const Icon = config.icon;
          
          return (
            <AlertDialog key={action}>
              <AlertDialogTrigger asChild>
                <Button
                  variant={config.variant}
                  size="sm"
                  disabled={isLoading}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {config.label}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{config.confirmTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {config.confirmDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleAction(action)}
                    className={config.variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    {config.label}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        })}
      </div>
    </div>
  );
}