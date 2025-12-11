"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/client/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    NumberOfCards,
    GenerateFlashcardsResponse,
} from "@/types/user/flashcard";

interface FlashcardGenerateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notebookId: string;
    selectedFileIds: string[];
    onSuccess?: () => void;
}

type GenerateStatus = "idle" | "queued" | "processing" | "done" | "failed";

const NUMBER_OPTIONS: { value: NumberOfCards; label: string }[] = [
    { value: "few", label: "Ít (5-8 thẻ)" },
    { value: "standard", label: "Tiêu chuẩn (10-15 thẻ)" },
    { value: "many", label: "Nhiều (15-25 thẻ)" },
];

export default function FlashcardGenerateModal({
    open,
    onOpenChange,
    notebookId,
    selectedFileIds,
    onSuccess,
}: FlashcardGenerateModalProps) {
    const [numberOfCards, setNumberOfCards] = useState<NumberOfCards>(
        "standard"
    );
    const [additionalRequirements, setAdditionalRequirements] = useState("");
    const [status, setStatus] = useState<GenerateStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const resetState = useCallback(() => {
        setStatus("idle");
        setErrorMessage(null);
        setAdditionalRequirements("");
        setNumberOfCards("standard");
    }, []);

    const handleClose = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen && (status === "queued" || status === "processing")) {
                return;
            }
            if (!nextOpen) {
                resetState();
            }
            onOpenChange(nextOpen);
        },
        [onOpenChange, resetState, status]
    );

    const handleGenerate = async () => {
        if (selectedFileIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 file từ danh sách nguồn");
            return;
        }

        setStatus("queued");
        setErrorMessage(null);

        try {
            const params = new URLSearchParams();
            selectedFileIds.forEach((id) => params.append("fileIds", id));
            params.append("numberOfCards", numberOfCards);
            if (additionalRequirements.trim()) {
                params.append("additionalRequirements", additionalRequirements.trim());
            }

            await api.post<GenerateFlashcardsResponse>(
                `/user/notebooks/${notebookId}/ai/flashcards/generate?${params.toString()}`
            );

            toast.success(
                "Đang tạo flashcards. Bạn sẽ nhận được thông báo khi hoàn thành."
            );
            onSuccess?.();
            resetState();
            onOpenChange(false);
        } catch (err: any) {
            setStatus("failed");
            setErrorMessage(
                err.response?.data?.message ||
                "Không thể tạo flashcards. Vui lòng thử lại."
            );
        }
    };

    useEffect(() => {
        if (open) {
            resetState();
        }
    }, [open, resetState]);

    const isProcessing = status === "queued" || status === "processing";
    const canSubmit = selectedFileIds.length > 0 && !isProcessing;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="size-4" />
                        Tạo Flashcards AI
                    </DialogTitle>
                    <DialogDescription>
                        Chọn tài liệu nguồn và yêu cầu để AI tạo bộ flashcards phù hợp.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Số lượng thẻ</Label>
                        <Select
                            value={numberOfCards}
                            onValueChange={(value: NumberOfCards) => setNumberOfCards(value)}
                            disabled={isProcessing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn số lượng thẻ" />
                            </SelectTrigger>
                            <SelectContent>
                                {NUMBER_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Yêu cầu bổ sung (tùy chọn)</Label>
                        <Textarea
                            placeholder="Ví dụ: Nhấn mạnh định nghĩa ngắn gọn, thêm ví dụ tiếng Việt..."
                            value={additionalRequirements}
                            onChange={(e) => setAdditionalRequirements(e.target.value)}
                            disabled={isProcessing}
                            rows={4}
                        />
                    </div>

                    {errorMessage && (
                        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="size-4 mt-0.5 shrink-0" />
                            <p className="leading-snug">{errorMessage}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleClose(false)}
                        disabled={isProcessing}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        onClick={handleGenerate}
                        disabled={!canSubmit}
                        className="gap-2"
                    >
                        {isProcessing && <Loader2 className="size-4 animate-spin" />}
                        Tạo Flashcards
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

