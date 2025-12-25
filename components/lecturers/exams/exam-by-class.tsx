"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { ExamResponse, PagedResponse, LecturerClassPagedResponse } from "@/types/lecturer";
import { ExamCard } from "./exam-card";
import { CreateExamModal } from "./create-exam-modal";

interface ExamByClassProps {
  classId: string;
  className: string;
}

export function ExamByClass({ classId, className }: ExamByClassProps) {
  const [exams, setExams] = useState<PagedResponse<ExamResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadExams();
  }, [classId, searchQuery]);

  const loadExams = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "20",
        sortBy: "createdAt",
        sortDir: "desc",
        ...(searchQuery && { q: searchQuery }),
      });
      
      const response = await api.get<PagedResponse<ExamResponse>>(
        `/api/exams/class/${classId}?${params}`
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
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
          <h2 className="text-2xl font-bold tracking-tight">
            Đề thi lớp {className}
          </h2>
          <p className="text-sm text-muted-foreground">
            Quản lý đề thi cho lớp học này
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đề thi
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đề thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

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
                <p className="text-sm">Tạo đề thi đầu tiên cho lớp này</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Exam Modal */}
      <CreateExamModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleExamCreated}
      />
    </div>
  );
}