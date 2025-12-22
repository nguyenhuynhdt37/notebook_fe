import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  School,
} from "lucide-react";
import { AssignmentInfo } from "@/types/admin/subject";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AssignmentRowProps {
  assignment: AssignmentInfo;
}

export default function AssignmentRow({ assignment }: AssignmentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow
        className={cn("group cursor-pointer", isExpanded && "bg-muted/30")}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="size-3.5 text-muted-foreground" />
                {assignment.termName}
              </div>
              <div className="flex flex-col gap-1 ml-5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3 text-muted-foreground" />
                  {assignment.lecturerName}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground italic">
                  <Mail className="size-2.5 text-muted-foreground" />
                  {assignment.lecturerEmail}
                </div>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-sm underline decoration-muted-foreground/30 underline-offset-4 font-medium">
              {assignment.classCount}
            </span>
            {assignment.note && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground max-w-[150px] truncate">
                <FileText className="size-2.5" />
                {assignment.note}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex flex-col items-center gap-1.5">
            <Badge
              variant={assignment.status === "ACTIVE" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4 rounded-sm font-normal"
            >
              {assignment.status === "ACTIVE" ? "Đang dạy" : "Đã xong"}
            </Badge>
            <Badge
              variant={
                assignment.approvalStatus === "APPROVED"
                  ? "outline"
                  : "secondary"
              }
              className={cn(
                "text-[9px] px-1 py-0 h-3.5 rounded-sm font-normal border-transparent",
                assignment.approvalStatus === "APPROVED"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
              )}
            >
              {assignment.approvalStatus === "APPROVED" ? (
                <span className="flex items-center gap-0.5">
                  <CheckCircle2 className="size-2" /> PD
                </span>
              ) : (
                <span className="flex items-center gap-0.5">
                  <Clock className="size-2" /> Chờ
                </span>
              )}
            </Badge>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={3} className="p-0 border-t-0">
            <div className="px-12 py-3 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <School className="size-3 px-0.5" />
                Danh sách lớp học ({assignment.classes?.length || 0})
              </div>
              {assignment.classes && assignment.classes.length > 0 ? (
                <div className="rounded border bg-background overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-7 text-[10px] py-0 px-3">
                          Mã lớp
                        </TableHead>
                        <TableHead className="h-7 text-[10px] py-0 px-3">
                          Tên lớp
                        </TableHead>
                        <TableHead className="h-7 text-[10px] py-0 px-3 text-center">
                          Sĩ số
                        </TableHead>
                        <TableHead className="h-7 text-[10px] py-0 px-3 text-right">
                          Trạng thái
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignment.classes.map((cls) => (
                        <TableRow key={cls.id} className="hover:bg-accent/50">
                          <TableCell className="h-8 py-1 px-3 text-[11px] font-mono">
                            {cls.code}
                          </TableCell>
                          <TableCell className="h-8 py-1 px-3 text-[11px] font-medium">
                            {cls.name}
                          </TableCell>
                          <TableCell className="h-8 py-1 px-3 text-[11px] text-center">
                            {cls.maxStudents}
                          </TableCell>
                          <TableCell className="h-8 py-1 px-3 text-right">
                            <span
                              className={cn(
                                "text-[9px] size-2 rounded-full inline-block",
                                cls.isActive
                                  ? "bg-green-500"
                                  : "bg-muted-foreground/30"
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic pb-2">
                  Chưa có thông tin lớp học chi tiết.
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
