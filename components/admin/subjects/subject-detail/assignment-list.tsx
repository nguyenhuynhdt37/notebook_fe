import { UserCheck } from "lucide-react";
import { AssignmentInfo } from "@/types/admin/subject";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AssignmentRow from "./assignment-row";

interface AssignmentListProps {
  assignments?: AssignmentInfo[];
}

export default function AssignmentList({ assignments }: AssignmentListProps) {
  return (
    <Card className="flex flex-col shadow-sm border-muted/60">
      <CardHeader className="pb-3 border-b border-muted/60">
        <div className="flex items-center gap-2">
          <UserCheck className="size-5 text-primary" />
          <CardTitle className="text-lg">Phân công giảng dạy</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Lịch sử và các đợt giảng dạy hiện tại
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        {assignments && assignments.length > 0 ? (
          <div className="rounded border bg-background overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                  <TableHead className="h-9 text-xs">
                    Học kỳ & Giảng viên
                  </TableHead>
                  <TableHead className="text-center h-9 text-xs">Lớp</TableHead>
                  <TableHead className="text-center h-9 text-xs">
                    Phê duyệt
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <AssignmentRow key={assignment.id} assignment={assignment} />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed rounded h-full bg-muted/10">
            <UserCheck className="size-8 mb-2 opacity-20" />
            <p className="text-[11px] font-medium italic">
              Chưa có lịch sử phân công giảng dạy
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
