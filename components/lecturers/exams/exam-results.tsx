"use client";

import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { ExamResultResponse, ExportFormat, PagedExamResults } from "@/types/lecturer/exam-result";

interface ExamResultsProps {
    examId: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    IN_PROGRESS: { label: "Đang làm", color: "bg-yellow-100 text-yellow-800" },
    SUBMITTED: { label: "Đã nộp", color: "bg-blue-100 text-blue-800" },
    AUTO_SUBMITTED: { label: "Tự động nộp", color: "bg-orange-100 text-orange-800" },
    GRADED: { label: "Đã chấm", color: "bg-green-100 text-green-800" },
};

export function ExamResults({ examId }: ExamResultsProps) {
    const [results, setResults] = useState<ExamResultResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadResults();
    }, [examId, page]);

    const loadResults = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedExamResults>(
                `/api/exams/${examId}/results?page=${page}&size=20`
            );
            setResults(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error("Error loading results:", error);
            toast.error("Không thể tải kết quả thi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true);
        try {
            const response = await api.post(
                `/api/exams/${examId}/export`,
                {
                    format,
                    includeStudentInfo: true,
                    includeScores: true,
                    includeTimings: true,
                },
                { responseType: "blob" }
            );

            // Create download link
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = format === "EXCEL"
                ? `ket-qua-thi-${examId}.xlsx`
                : `ket-qua-thi-${examId}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Xuất file ${format} thành công`);
        } catch (error) {
            console.error("Error exporting:", error);
            toast.error("Không thể xuất file");
        } finally {
            setIsExporting(false);
        }
    };

    const filteredResults = results.filter(
        (r) =>
            r.studentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Kết quả thi ({totalElements} sinh viên)
                    </CardTitle>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={isExporting || results.length === 0}>
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? "Đang xuất..." : "Xuất kết quả"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport("EXCEL")}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Xuất Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("CSV")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Xuất CSV (.csv)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo MSSV hoặc họ tên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Table */}
                {filteredResults.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {results.length === 0
                            ? "Chưa có sinh viên nào làm bài"
                            : "Không tìm thấy kết quả"}
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">STT</TableHead>
                                    <TableHead>MSSV</TableHead>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead className="text-center">Lần thi</TableHead>
                                    <TableHead className="text-center">Điểm</TableHead>
                                    <TableHead className="text-center">%</TableHead>
                                    <TableHead className="text-center">Trạng thái</TableHead>
                                    <TableHead className="text-center">Đạt/Rớt</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResults.map((result, index) => {
                                    const status = statusLabels[result.status] || statusLabels.GRADED;
                                    return (
                                        <TableRow key={result.attemptId}>
                                            <TableCell>{page * 20 + index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                {result.studentCode}
                                            </TableCell>
                                            <TableCell>{result.studentName}</TableCell>
                                            <TableCell className="text-center">
                                                {result.attemptNumber}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {result.totalScore}/{result.totalPossibleScore}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {result.percentageScore?.toFixed(1)}%
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={status.color}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {result.isPassed !== null && (
                                                    <Badge
                                                        className={
                                                            result.isPassed
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }
                                                    >
                                                        {result.isPassed ? "Đạt" : "Rớt"}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {result.timeSpentFormatted || "-"}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        >
                            Trước
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Trang {page + 1} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(page + 1)}
                        >
                            Sau
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
