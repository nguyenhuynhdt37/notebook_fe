import { GraduationCap } from "lucide-react";
import { SubjectMajorDetail } from "@/types/admin/subject";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MajorListProps {
  majors?: SubjectMajorDetail[];
}

export default function MajorList({ majors }: MajorListProps) {
  return (
    <Card className="flex flex-col shadow-sm border-muted/60">
      <CardHeader className="pb-3 border-b border-muted/60">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          <CardTitle className="text-lg">Chương trình đào tạo</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Môn học được áp dụng cho các ngành đào tạo sau
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        {majors && majors.length > 0 ? (
          <div className="rounded border bg-background overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
                  <TableHead className="w-[100px] h-9 text-xs">
                    Mã ngành
                  </TableHead>
                  <TableHead className="h-9 text-xs">Tên ngành</TableHead>
                  <TableHead className="text-center h-9 text-xs">HK</TableHead>
                  <TableHead className="text-center h-9 text-xs">
                    Loại
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {majors.map((major) => (
                  <TableRow key={major.id} className="hover:bg-accent/30 h-11">
                    <TableCell>
                      <span className="font-mono text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded">
                        {major.code}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] py-1">
                      <span className="text-xs font-semibold truncate block">
                        {major.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">
                        {major.knowledgeBlock || "Chưa xếp khối"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      {major.termNo ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={major.isRequired ? "default" : "outline"}
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 rounded-sm font-normal",
                          !major.isRequired &&
                            "text-muted-foreground border-muted-foreground/30"
                        )}
                      >
                        {major.isRequired ? "Bắt buộc" : "Tự chọn"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed rounded h-full bg-muted/10">
            <GraduationCap className="size-8 mb-2 opacity-20" />
            <p className="text-[11px] font-medium italic">
              Chưa thuộc ngành đào tạo nào
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
