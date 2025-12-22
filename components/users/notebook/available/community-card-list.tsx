"use client";

import { useRouter } from "next/navigation";
import { FileText, Users, Calendar, Globe, Lock } from "lucide-react";
import { AvailableGroupResponse } from "@/types/user/community";
import { Card } from "@/components/ui/card";

interface CommunityCardListProps {
  groups: AvailableGroupResponse[];
}

export default function CommunityCardList({ groups }: CommunityCardListProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
            <div className="absolute top-2 left-2 z-20">
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
                  <span>{formatDate(group.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
