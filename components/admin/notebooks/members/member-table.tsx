"use client";

import { useState } from "react";
import {
  MoreVertical,
  Mail,
  Calendar,
  FileText,
  Video,
  BookOpen,
  Mic,
  HelpCircle,
  MessageSquare,
  Bot,
  Shield,
  Ban,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { MemberResponse } from "@/types/admin/member";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MemberRoleDialog from "./member-role-dialog";
import MemberDeleteDialog from "./member-delete-dialog";
import MemberBlockDialog from "./member-block-dialog";

interface MemberTableProps {
  members: MemberResponse[];
  onRefresh?: () => void;
}

export default function MemberTable({ members, onRefresh }: MemberTableProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(
    null
  );
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa tham gia";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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
        return "Đang chờ duyệt";
      case "approved":
        return "Đã duyệt";
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
            <TableHead className="w-[60px]">Avatar</TableHead>
            <TableHead>Thành viên</TableHead>
            <TableHead className="w-[120px]">Vai trò</TableHead>
            <TableHead className="w-[120px]">Trạng thái</TableHead>
            <TableHead className="w-[180px]">Đóng góp</TableHead>
            <TableHead className="w-[120px]">Ngày tham gia</TableHead>
            <TableHead className="w-[60px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="hover:bg-accent/50">
              <TableCell>
                <Avatar className="size-10">
                  <AvatarImage src={member.userAvatarUrl || undefined} />
                  <AvatarFallback>
                    {member.userFullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <span className="font-medium text-foreground block">
                    {member.userFullName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="size-3" />
                    <span>{member.userEmail}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    member.role
                  )}`}
                >
                  {getRoleLabel(member.role)}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    member.status
                  )}`}
                >
                  {getStatusLabel(member.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <FileText className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.fileCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Video className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.videoCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <BookOpen className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.flashcardCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Mic className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.ttsCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <HelpCircle className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.quizCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <MessageSquare className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.messageCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Bot className="size-3" />
                    <span className="font-medium text-foreground">
                      {member.statistics.ragQueryCount}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>{formatDate(member.joinedAt)}</span>
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
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMember(member);
                        setRoleDialogOpen(true);
                      }}
                    >
                      <Shield className="size-4 mr-2" />
                      Chỉnh quyền
                    </DropdownMenuItem>
                    {member.status === "blocked" ? (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setBlockDialogOpen(true);
                        }}
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Mở chặn
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setBlockDialogOpen(true);
                        }}
                      >
                        <Ban className="size-4 mr-2" />
                        Chặn thành viên
                      </DropdownMenuItem>
                    )}
                    {member.status === "pending" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Implement approve
                          }}
                        >
                          Duyệt thành viên
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Implement reject
                          }}
                        >
                          Từ chối
                        </DropdownMenuItem>
                      </>
                    )}
                    {member.role !== "owner" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedMember(member);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <UserX className="size-4 mr-2" />
                          Xóa khỏi nhóm
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedMember && (
        <>
          <MemberRoleDialog
            member={selectedMember}
            open={roleDialogOpen}
            onOpenChange={(open) => {
              setRoleDialogOpen(open);
              if (!open) {
                setSelectedMember(null);
              }
            }}
            onSuccess={() => {
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
          <MemberDeleteDialog
            member={selectedMember}
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) {
                setSelectedMember(null);
              }
            }}
            onSuccess={() => {
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
          <MemberBlockDialog
            member={selectedMember}
            open={blockDialogOpen}
            onOpenChange={(open) => {
              setBlockDialogOpen(open);
              if (!open) {
                setSelectedMember(null);
              }
            }}
            onSuccess={() => {
              if (onRefresh) {
                onRefresh();
              }
            }}
          />
        </>
      )}
    </div>
  );
}
