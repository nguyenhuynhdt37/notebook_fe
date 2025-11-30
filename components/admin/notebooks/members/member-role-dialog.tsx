"use client";

import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { MemberResponse } from "@/types/admin/member";
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

interface MemberRoleDialogProps {
  member: MemberResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function MemberRoleDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: MemberRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "member">(
    "member"
  );
  const [isLoading, setIsLoading] = useState(false);

  if (!member) return null;

  const currentRole =
    member.role === "owner" ? null : (member.role as "admin" | "member");

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Chủ sở hữu";
      case "admin":
        return "Quản trị viên";
      case "member":
        return "Thành viên";
      default:
        return role;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      if (newOpen && currentRole) {
        setSelectedRole(currentRole);
      }
      onOpenChange(newOpen);
    }
  };

  const handleSubmit = async () => {
    if (selectedRole === member.role) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    try {
      await api.put(
        `/admin/community/members/${member.id}/role?role=${selectedRole}`
      );
      toast.success(`Đã cập nhật quyền thành ${getRoleLabel(selectedRole)}`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật quyền";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (member.role === "owner") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Không thể thay đổi quyền
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Không thể thay đổi quyền của chủ sở hữu (owner).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Chỉnh quyền thành viên
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Thay đổi quyền của{" "}
            <span className="font-semibold text-foreground">
              {member.userFullName}
            </span>
            . Quyền hiện tại:{" "}
            <span className="font-semibold text-foreground">
              {getRoleLabel(member.role)}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quyền mới</label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as "admin" | "member")
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Thành viên</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Shield className="mr-2 size-4" />
                Cập nhật quyền
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
