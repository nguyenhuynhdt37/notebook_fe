"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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

  if (isLoading && !exams) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đề thi</h1>
          <p className="text-sm text-muted-foreground">
            Tạo và quản lý đề thi trực tuyến cho các lớp học
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đề thi mới
        </Button>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đề thi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <ExamStats
        totalExams={exams?.totalElements || 0}
        draftExams={exams?.content.filter(e => e.status === "DRAFT").length || 0}
        publishedExams={exams?.content.filter(e => e.status === "PUBLISHED").length || 0}
        activeExams={exams?.content.filter(e => e.status === "ACTIVE").length || 0}
      />

      {/* Exam List */}
      <div className="space-y-4">
        {exams?.content.map((exam) => (
          <ExamCard key={exam.id} exam={exam} onUpdate={loadExams} />
        ))}
        
        {exams?.content.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium">Chưa có đề thi nào</p>
                <p className="text-sm">Tạo đề thi đầu tiên để bắt đầu</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {exams && exams.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={exams.first}
          >
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {exams.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={exams.last}
          >
            Sau
          </Button>
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