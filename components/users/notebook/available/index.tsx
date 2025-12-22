"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { AvailableGroupsResponse } from "@/types/user/community";
import CommunityFilter from "./community-filter";
import CommunityCardList from "./community-card-list";
import CommunityPagination from "./community-pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Notebooks() {
  const [data, setData] = useState<AvailableGroupsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadGroups();
  }, [page, q, sortBy, sortDir]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
      });

      const response = await api.get<AvailableGroupsResponse>(
        `/user/community/available?${params}`
      );

      setData(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Không thể tải danh sách nhóm cộng đồng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
    setPage(0);
  };

  const handleSortChange = (value: string) => {
    if (value.includes("_")) {
      const [field, dir] = value.split("_");
      setSortBy(field);
      setSortDir(dir as "asc" | "desc");
    } else {
      setSortBy(value);
      setSortDir("desc");
    }
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tìm kiếm và lọc</CardTitle>
          <CardDescription className="mt-1">
            Tìm kiếm nhóm cộng đồng theo tiêu đề hoặc mô tả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityFilter
            q={q}
            sortBy={sortBy}
            sortDir={sortDir}
            onQChange={handleQChange}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="relative w-full aspect-square bg-muted">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-full" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3" />
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-muted-foreground/20">
                    <div className="h-3 bg-muted-foreground/20 rounded w-16" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-20" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {q
                ? "Không tìm thấy nhóm nào phù hợp"
                : "Chưa có nhóm cộng đồng nào"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CommunityCardList groups={data.items} />
          {data.meta.totalPages > 1 && (
            <CommunityPagination
              meta={data.meta}
              page={page}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
