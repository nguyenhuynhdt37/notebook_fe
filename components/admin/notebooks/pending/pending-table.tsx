"use client";

import {
  MoreVertical,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Ban,
  CheckCircle,
} from "lucide-react";
import { PendingRequestResponse } from "@/types/admin/pending-request";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PendingTableProps {
  requests: PendingRequestResponse[];
  onApprove?: (request: PendingRequestResponse) => void;
  onReject?: (request: PendingRequestResponse) => void;
  onBlock?: (request: PendingRequestResponse) => void;
  onUnblock?: (request: PendingRequestResponse) => void;
}

export default function PendingTable({
  requests,
  onApprove,
  onReject,
  onBlock,
  onUnblock,
}: PendingTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa tham gia";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang chờ";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Đã từ chối";
      case "blocked":
        return "Đã chặn";
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-muted text-foreground";
      case "admin":
        return "bg-muted text-foreground";
      case "member":
        return "bg-muted text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Notebook</TableHead>
            <TableHead>Người yêu cầu</TableHead>
            <TableHead className="w-[120px]">Vai trò</TableHead>
            <TableHead className="w-[120px]">Trạng thái</TableHead>
            <TableHead className="w-[150px]">Ngày tạo</TableHead>
            <TableHead className="w-[150px]">Ngày tham gia</TableHead>
            <TableHead className="w-[60px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-accent/50">
              <TableCell>
                <span className="font-medium text-foreground">
                  {request.notebookTitle}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <span className="font-medium text-foreground block">
                    {request.userFullName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3" />
                    <span>{request.userEmail}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    request.role
                  )}`}
                >
                  {getRoleLabel(request.role)}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    request.status
                  )}`}
                >
                  {getStatusLabel(request.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>{formatDate(request.joinedAt)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {request.status === "pending" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onApprove) {
                              onApprove(request);
                            }
                          }}
                        >
                          <CheckCircle2 className="size-4 mr-2" />
                          Duyệt yêu cầu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (onReject) {
                              onReject(request);
                            }
                          }}
                        >
                          <XCircle className="size-4 mr-2" />
                          Từ chối
                        </DropdownMenuItem>
                      </>
                    )}
                    {request.status === "approved" && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (onBlock) {
                            onBlock(request);
                          }
                        }}
                      >
                        <Ban className="size-4 mr-2" />
                        Chặn thành viên
                      </DropdownMenuItem>
                    )}
                    {request.status === "blocked" && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (onUnblock) {
                            onUnblock(request);
                          }
                        }}
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Mở chặn
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
