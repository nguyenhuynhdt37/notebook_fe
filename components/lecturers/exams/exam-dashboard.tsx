"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/api/client/axios";
import { ExamResponse, PagedResponse } from "@/types/lecturer";
import { ExamCard } from "./exam-card";
import { CreateExamModal } from "./create-exam-modal";
import { ExamStats } from "./exam-stats";

export default function ExamDashboard() {
  const [exams, setExams] = useState<PagedResponse<ExamResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    loadExams();
  }, [page, searchQuery]);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        sortBy: "createdAt",
        sortDir: "desc",
        ...(searchQuery && { q: searchQuery }),
      });

      const response = await api.get<PagedResponse<ExamResponse>>(
        `/api/exams/lecturer?${params}`
      );
      setExams(response.data);
    } catch (error) {
      console.error("Error loading exams:", error);
      toast.error("Không thể tải danh sách đề thi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamCreated = () => {
    setShowCreateModal(false);
    loadExams();
  };

  const filteredExams = exams?.content.filter(exam => {
    if (statusFilter === "all") return true;
    return exam.status === statusFilter;
  }) || [];

  if (isLoading && !exams) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý đề thi</h1>
          {/* Stats inline */}
          <ExamStats
            totalExams={exams?.totalElements || 0}
            draftExams={exams?.content.filter(e => e.status === "DRAFT").length || 0}
            publishedExams={exams?.content.filter(e => e.status === "PUBLISHED").length || 0}
            activeExams={exams?.content.filter(e => e.status === "ACTIVE").length || 0}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/lecturer/file-management')}
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            Quản lý tài liệu
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo đề thi
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đề thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all" className="text-xs px-3">Tất cả</TabsTrigger>
            <TabsTrigger value="DRAFT" className="text-xs px-3">Nháp</TabsTrigger>
            <TabsTrigger value="PUBLISHED" className="text-xs px-3">Đã xuất bản</TabsTrigger>
            <TabsTrigger value="ACTIVE" className="text-xs px-3">Đang thi</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Exam List - Grid Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onUpdate={loadExams} />
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Chưa có đề thi nào</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {statusFilter !== "all"
                  ? "Không có đề thi nào với trạng thái này"
                  : "Bắt đầu bằng việc tạo đề thi đầu tiên"}
              </p>
              {statusFilter === "all" && (
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo đề thi
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {exams && exams.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Hiển thị {filteredExams.length} / {exams.totalElements} đề thi
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={exams.first}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(5, exams.totalPages) }).map((_, i) => {
                const pageNum = i;
                return (
                  <Button
                    key={i}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => p + 1)}
              disabled={exams.last}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      <CreateExamModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleExamCreated}
      />
    </div>
  );
}