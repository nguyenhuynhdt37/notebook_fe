"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogIn, Users, Clock, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { useUserStore } from "@/stores/user";
import { MembershipStatusResponse } from "@/types/user/community";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MembershipCheckProps {
  notebookId: string;
  onJoinSuccess?: () => void;
}

export default function MembershipCheck({
  notebookId,
  onJoinSuccess,
}: MembershipCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [membership, setMembership] = useState<MembershipStatusResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (user) {
      checkMembership();
    } else {
      setIsLoading(false);
    }
  }, [notebookId, user]);

  const checkMembership = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get<MembershipStatusResponse>(
        `/user/community/${notebookId}/membership`
      );
      setMembership(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // User chưa đăng nhập hoặc token hết hạn
        setMembership(null);
      } else {
        console.error("Error checking membership:", error);
        toast.error("Không thể kiểm tra trạng thái tham gia");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(pathname);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const handleJoin = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    setIsJoining(true);
    try {
      await api.post(`/user/community/join`, {
        notebookId,
      });
      toast.success(
        membership?.requiresApproval
          ? "Đã gửi yêu cầu tham gia nhóm. Vui lòng chờ duyệt."
          : "Đã tham gia nhóm thành công"
      );
      await checkMembership();
      if (onJoinSuccess) {
        onJoinSuccess();
      }
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error(error.response?.data?.message || "Không thể tham gia nhóm");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAccess = () => {
    router.push(`/notebook/${notebookId}/workspace`);
  };

  const getButtonText = () => {
    if (!membership) return "";

    if (membership.isMember) {
      return "Truy cập ngay";
    }

    if (membership.status === "pending") {
      return "Đang chờ duyệt";
    }

    if (membership.status === "blocked") {
      return "Bị chặn";
    }

    if (membership.canJoin) {
      if (membership.requiresApproval) {
        return membership.status === "rejected"
          ? "Xin tham gia lại"
          : "Xin tham gia";
      } else {
        return "Tham gia nhóm";
      }
    }

    return "";
  };

  const getDescription = () => {
    if (!membership) return "";

    if (membership.isMember) {
      return "Bạn có thể truy cập vào nhóm ngay bây giờ";
    }

    if (membership.status === "pending") {
      return "Yêu cầu tham gia của bạn đang được xem xét";
    }

    if (membership.status === "blocked") {
      return "Bạn không thể tham gia nhóm này";
    }

    if (membership.canJoin) {
      if (membership.requiresApproval) {
        return membership.status === "rejected"
          ? "Bạn có thể xin tham gia lại nhóm này"
          : "Nhóm này yêu cầu phê duyệt. Yêu cầu của bạn sẽ được xem xét bởi quản trị viên.";
      } else {
        return "Tham gia để truy cập và tương tác với nhóm";
      }
    }

    return "";
  };

  if (isLoading) {
    return null;
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <LogIn className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">
                Đăng nhập để tham gia nhóm
              </p>
              <p className="text-xs text-muted-foreground">
                Bạn cần đăng nhập để tham gia nhóm cộng đồng này
              </p>
            </div>
            <Button onClick={handleLogin} className="w-full sm:w-auto">
              <LogIn className="size-4 mr-2" />
              Đăng nhập
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Đang check membership
  if (!membership) {
    return null;
  }

  // Đã là thành viên
  if (membership.isMember) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="size-8 text-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">Bạn đã tham gia nhóm</p>
              <p className="text-xs text-muted-foreground">
                {getDescription()}
              </p>
            </div>
            <Button onClick={handleAccess} className="w-full sm:w-auto">
              <Users className="size-4 mr-2" />
              {getButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Đang chờ duyệt
  if (membership.status === "pending") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Clock className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">Đang chờ duyệt</p>
              <p className="text-xs text-muted-foreground">
                {getDescription()}
              </p>
            </div>
            <Button variant="outline" disabled className="w-full sm:w-auto">
              <Clock className="size-4 mr-2" />
              {getButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Bị chặn
  if (membership.status === "blocked") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Ban className="size-8 text-destructive" />
            <div>
              <p className="text-sm font-medium mb-1">Bạn đã bị chặn</p>
              <p className="text-xs text-muted-foreground">
                {getDescription()}
              </p>
            </div>
            <Button variant="outline" disabled className="w-full sm:w-auto">
              <Ban className="size-4 mr-2" />
              {getButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Có thể tham gia (chưa join hoặc đã rejected)
  if (membership.canJoin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Users className="size-8 text-foreground" />
            <div>
              <p className="text-sm font-medium mb-1">
                {membership.requiresApproval
                  ? "Xin tham gia nhóm"
                  : "Tham gia nhóm"}
              </p>
              <p className="text-xs text-muted-foreground">
                {getDescription()}
              </p>
            </div>
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full sm:w-auto"
            >
              <Users className="size-4 mr-2" />
              {isJoining ? "Đang xử lý..." : getButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
