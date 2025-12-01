"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import {
  PagedResponse,
  PendingRequestResponse,
} from "@/types/admin/pending-request";
import PendingFilter from "./pending-filter";
import PendingTable from "./pending-table";
import PendingPagination from "./pending-pagination";
import ApproveMemberDialog from "./approve-member-dialog";
import ApproveAllButton from "./approve-all-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PendingRequests() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] =
    useState<PagedResponse<PendingRequestResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [q, setQ] = useState("");
  const [notebookId, setNotebookId] = useState("");
  const [status, setStatus] = useState("pending");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) {
      const notebookIdParam = searchParams.get("notebookId");
      if (notebookIdParam) {
        setNotebookId(notebookIdParam);
      }
      setIsReady(true);
    }
  }, [searchParams, isReady]);

  useEffect(() => {
    if (!isReady) return;

    const controller = new AbortController();
    loadRequests(controller.signal);

    return () => {
      controller.abort();
    };
  }, [page, q, notebookId, status, sortBy, sortDir, isReady]);

  const loadRequests = async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const currentNotebookId = searchParams.get("notebookId") || notebookId;
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        ...(q && { q }),
        ...(currentNotebookId && { notebookId: currentNotebookId }),
        ...(status && { status }),
      });

      const response = await api.get<PagedResponse<PendingRequestResponse>>(
        `/admin/community/pending-requests?${params}`,
        { signal }
      );

      if (!signal?.aborted) {
        setData(response.data);
      }
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "CanceledError") {
        return;
      }
      console.error("Error fetching pending requests:", error);
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleQChange = (value: string) => {
    setQ(value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
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

  const [approveDialogRequest, setApproveDialogRequest] =
    useState<PendingRequestResponse | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);

  const handleApproveClick = (request: PendingRequestResponse) => {
    setApproveDialogRequest(request);
    setApproveDialogOpen(true);
  };

  const handleApproveSuccess = () => {
    loadRequests();
  };

  const handleReject = async (request: PendingRequestResponse) => {
    // TODO: Implement reject
    toast.info("Chức năng từ chối yêu cầu đang được phát triển");
  };

  const handleBlock = async (request: PendingRequestResponse) => {
    // TODO: Implement block
    toast.info("Chức năng chặn thành viên đang được phát triển");
  };

  const handleUnblock = async (request: PendingRequestResponse) => {
    // TODO: Implement unblock
    toast.info("Chức năng mở chặn đang được phát triển");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Yêu cầu tham gia
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Quản lý các yêu cầu tham gia notebook
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl">Danh sách yêu cầu</CardTitle>
              <CardDescription className="mt-1">
                {data
                  ? `Tổng cộng ${data.meta.total} yêu cầu`
                  : "Tất cả yêu cầu tham gia notebook"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ApproveAllButton
                notebookId={
                  searchParams.get("notebookId") || notebookId || undefined
                }
                pendingCount={data?.meta.total || 0}
                onSuccess={handleApproveSuccess}
              />
              <PendingFilter
                q={q}
                status={status}
                sortBy={sortBy}
                sortDir={sortDir}
                onQChange={handleQChange}
                onStatusChange={handleStatusChange}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-64 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="space-y-4">
              <PendingTable
                requests={data.items}
                onApprove={handleApproveClick}
                onReject={handleReject}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
              />
              {data.meta.totalPages > 1 && (
                <div className="pt-4 border-t">
                  <PendingPagination
                    meta={data.meta}
                    page={page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không tìm thấy yêu cầu
              </p>
              <p className="text-sm text-muted-foreground">
                {q || status !== "pending"
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Chưa có yêu cầu nào"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ApproveMemberDialog
        request={approveDialogRequest}
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onSuccess={handleApproveSuccess}
      />
    </div>
  );
}
