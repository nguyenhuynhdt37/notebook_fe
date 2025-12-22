"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApproveAssignmentRequest } from "@/types/admin/teaching-assignment";

interface AssignmentApprovalDialogProps {
  assignmentId: string;
  subjectName: string;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
}

export default function AssignmentApprovalDialog({
  assignmentId,
  subjectName,
  currentStatus,
  open,
  onOpenChange,
  onApprove,
}: AssignmentApprovalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"APPROVED" | "REJECTED">(
    currentStatus === "REJECTED" ? "REJECTED" : "APPROVED"
  );
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const request: ApproveAssignmentRequest = {
        status,
        ...(note && { note }),
      };
      await api.patch(
        `/admin/teaching-assignments/${assignmentId}/approval`,
        request
      );
      toast.success(
        status === "APPROVED"
          ? "Phê duyệt phân công thành công"
          : "Từ chối phân công thành công"
      );
      onOpenChange(false);
      onApprove();
      setNote("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Không thể cập nhật phân công"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Phê duyệt phân công</DialogTitle>
          <DialogDescription>
            Xem xét và phê duyệt phân công môn{" "}
            <span className="font-medium text-foreground">{subjectName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as "APPROVED" | "REJECTED")}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">Phê duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder="Nhập lý do hoặc ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant={status === "REJECTED" ? "destructive" : "default"}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {status === "APPROVED" ? "Phê duyệt" : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
