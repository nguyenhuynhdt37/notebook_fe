"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  XCircle,
  Globe,
  Lock,
} from "lucide-react";
import { JoinedGroupResponse } from "@/types/user/community";
import { Card } from "@/components/ui/card";

interface MyGroupsCardListProps {
  groups: JoinedGroupResponse[];
}

export default function MyGroupsCardList({ groups }: MyGroupsCardListProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="size-4" />;
      case "pending":
        return <Clock className="size-4" />;
      case "rejected":
        return <XCircle className="size-4" />;
      case "blocked":
        return <Ban className="size-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Đã tham gia";
      case "pending":
        return "Đang chờ duyệt";
      case "rejected":
        return "Bị từ chối";
      case "blocked":
        return "Bị chặn";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-muted text-foreground";
      case "pending":
        return "bg-muted text-foreground";
      case "rejected":
        return "bg-muted text-foreground";
      case "blocked":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    return visibility === "public" ? "Công khai" : "Riêng tư";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {groups.map((group) => (
        <Card
          key={group.id}
          className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group p-0 border-0"
          onClick={() => router.push(`/notebook/${group.id}`)}
          aria-label={`Xem chi tiết nhóm ${group.title}`}
        >
          <div className="relative w-full aspect-square overflow-hidden bg-muted">
            {group.thumbnailUrl ? (
              <>
                <img
                  src={group.thumbnailUrl}
                  alt={group.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <FileText className="size-16 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 items-end">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  group.membershipStatus
                )}`}
              >
                {getStatusIcon(group.membershipStatus)}
                {getStatusLabel(group.membershipStatus)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                {group.visibility === "public" ? (
                  <Globe className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
                {getVisibilityLabel(group.visibility)}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
              <h3 className="text-base font-semibold line-clamp-2 mb-2 drop-shadow-lg">
                {group.title}
              </h3>
              {group.description && (
                <p className="text-xs text-white/90 line-clamp-2 drop-shadow-md mb-3">
                  {group.description}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/20">
                <div className="flex items-center gap-1 text-xs text-white/90">
                  <Users className="size-3.5" />
                  <span className="font-medium">{group.memberCount}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/90">
                  <Calendar className="size-3.5" />
                  <span>
                    {group.joinedAt
                      ? formatDate(group.joinedAt)
                      : formatDate(group.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
