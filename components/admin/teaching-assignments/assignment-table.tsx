"use client";

import { useState } from "react";
import { MoreVertical, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  AssignmentResponse,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
} from "@/types/admin/teaching-assignment";
import AssignmentDeleteDialog from "./assignment-delete-dialog";
import AssignmentApprovalDialog from "./assignment-approval-dialog";

interface AssignmentTableProps {
  assignments: AssignmentResponse[];
  onRefresh: () => void;
}

export default function AssignmentTable({
  assignments,
  onRefresh,
}: AssignmentTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    id: string;
    subjectName: string;
    status: string;
  } | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(-2)
      .toUpperCase();
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12">Giảng viên</TableHead>
              <TableHead className="h-12">Môn học</TableHead>
              <TableHead className="h-12">Học kỳ</TableHead>
              <TableHead className="h-12">Trạng thái</TableHead>
              <TableHead className="h-12 text-center">Lớp / SV</TableHead>
              <TableHead className="w-[60px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id} className="hover:bg-accent/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage
                        src={assignment.teacher.avatarUrl || undefined}
                      />
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(assignment.teacher.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {assignment.teacher.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {assignment.teacher.lecturerCode ||
                          assignment.teacher.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {assignment.subject.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {assignment.subject.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{assignment.term.name}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={APPROVAL_STATUS_COLORS[assignment.approvalStatus]}
                  >
                    {APPROVAL_STATUS_LABELS[assignment.approvalStatus]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      {assignment.classCount}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="size-3.5" />
                      {assignment.studentCount}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {assignment.approvalStatus === "PENDING" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAssignment({
                                id: assignment.id,
                                subjectName: assignment.subject.name,
                                status: assignment.approvalStatus,
                              });
                              setApprovalDialogOpen(true);
                            }}
                          >
                            Phê duyệt
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedAssignment({
                            id: assignment.id,
                            subjectName: assignment.subject.name,
                            status: assignment.approvalStatus,
                          });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedAssignment && (
        <>
          <AssignmentDeleteDialog
            assignmentId={selectedAssignment.id}
            subjectName={selectedAssignment.subjectName}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onDelete={onRefresh}
          />
          <AssignmentApprovalDialog
            assignmentId={selectedAssignment.id}
            subjectName={selectedAssignment.subjectName}
            currentStatus={selectedAssignment.status}
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            onApprove={onRefresh}
          />
        </>
      )}
    </>
  );
}
