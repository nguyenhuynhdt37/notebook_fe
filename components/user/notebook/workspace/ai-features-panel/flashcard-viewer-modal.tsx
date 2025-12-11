"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, BookOpen, Loader2, Sparkles, ChevronLeft, ChevronRight, RotateCcw, Lightbulb, Eye, EyeOff } from "lucide-react";
import api from "@/api/client/axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlashcardListResponse } from "@/types/user/flashcard";

interface FlashcardViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notebookId: string;
    aiSetId: string | null;
}

const STATUS_LABELS: Record<
    FlashcardListResponse["status"],
    { label: string; tone: "default" | "processing" | "error" }
> = {
    queued: { label: "Đang chờ xử lý", tone: "processing" },
    processing: { label: "Đang xử lý", tone: "processing" },
    done: { label: "Hoàn thành", tone: "default" },
    failed: { label: "Thất bại", tone: "error" },
};

export default function FlashcardViewerModal({
    open,
    onOpenChange,
    notebookId,
    aiSetId,
}: FlashcardViewerModalProps) {
    const [flashcardsData, setFlashcardsData] =
        useState<FlashcardListResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const fetchFlashcards = useCallback(async () => {
        if (!notebookId || !aiSetId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get<FlashcardListResponse>(
                `/user/notebooks/${notebookId}/ai/flashcards/${aiSetId}`
            );
            setFlashcardsData(response.data);
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Không thể tải bộ flashcards này."
            );
        } finally {
            setLoading(false);
        }
    }, [aiSetId, notebookId]);

    // Handler functions
    const handleNextCard = useCallback(() => {
        if (flashcardsData && currentCardIndex < flashcardsData.flashcards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        }
    }, [flashcardsData, currentCardIndex]);

    const handlePrevCard = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
        }
    }, [currentCardIndex]);

    const handleFlipCard = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    const handleToggleHint = useCallback(() => {
        setShowHint(prev => !prev);
    }, []);

    const handleRestart = useCallback(() => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowHint(false);
    }, []);

    useEffect(() => {
        if (open && aiSetId) {
            fetchFlashcards();
        }
    }, [open, aiSetId, fetchFlashcards]);

    // Reset state when modal opens or card changes
    useEffect(() => {
        if (open) {
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setShowHint(false);
        }
    }, [open]);

    useEffect(() => {
        setIsFlipped(false);
        setShowHint(false);
    }, [currentCardIndex]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!open || !flashcardsData) return;

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    handlePrevCard();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleNextCard();
                    break;
                case ' ':
                case 'Enter':
                    event.preventDefault();
                    handleFlipCard();
                    break;
                case 'h':
                case 'H':
                    if (flashcardsData.flashcards[currentCardIndex]?.hint) {
                        event.preventDefault();
                        handleToggleHint();
                    }
                    break;
                case 'r':
                case 'R':
                    event.preventDefault();
                    handleRestart();
                    break;
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [open, flashcardsData, currentCardIndex, handlePrevCard, handleNextCard, handleFlipCard, handleToggleHint, handleRestart]);

    const statusInfo = flashcardsData
        ? STATUS_LABELS[flashcardsData.status]
        : null;

    const renderBody = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="size-6 animate-spin mb-2" />
                    Đang tải flashcards...
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <AlertCircle className="size-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchFlashcards}>
                        Thử lại
                    </Button>
                </div>
            );
        }

        if (!flashcardsData) {
            return null;
        }

        if (flashcardsData.status !== "done") {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        {statusInfo?.label || "Đang xử lý flashcards..."}
                    </p>
                    {flashcardsData.errorMessage && (
                        <p className="text-sm text-destructive">
                            {flashcardsData.errorMessage}
                        </p>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchFlashcards}>
                        Làm mới
                    </Button>
                </div>
            );
        }

        if (flashcardsData.flashcards.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                    <div className="inline-flex p-3 rounded-full bg-muted/50">
                        <Sparkles className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Chưa có flashcards nào trong bộ này.
                    </p>
                </div>
            );
        }

        const currentCard = flashcardsData.flashcards[currentCardIndex];
        const totalCards = flashcardsData.flashcards.length;

        return (
            <div className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                                Thẻ {currentCardIndex + 1}
                            </span>
                            <span className="text-muted-foreground">
                                / {totalCards}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRestart}
                            className="h-8 px-3 text-xs hover:bg-muted/80 transition-colors"
                        >
                            <RotateCcw className="size-3 mr-1" />
                            Bắt đầu lại
                        </Button>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-primary to-primary/80 h-2.5 rounded-full transition-all duration-500 ease-in-out shadow-sm"
                            style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-center">
                        <div className="flex gap-1">
                            {Array.from({ length: totalCards }, (_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index <= currentCardIndex
                                            ? 'bg-primary shadow-sm'
                                            : 'bg-muted-foreground/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <div className="relative group">
                    <div 
                        className="relative w-full h-80 cursor-pointer perspective-1000 select-none"
                        onClick={handleFlipCard}
                    >
                        <div 
                            className={`relative w-full h-full preserve-3d transition-transform duration-700 ease-in-out transform-gpu ${
                                isFlipped ? 'rotate-y-180' : 'rotate-y-0'
                            }`}
                        >
                            {/* Front Side */}
                            <Card className="absolute inset-0 w-full h-full backface-hidden border-2 border-primary/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 active:scale-95 transform-gpu">
                                <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div className="space-y-6">
                                        <div className="inline-flex p-3 rounded-full bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-110">
                                            <BookOpen className="size-8 text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-foreground leading-relaxed max-w-md transition-all duration-300 group-hover:text-primary">
                                                {currentCard.frontText}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
                                            <span className="transition-all duration-300 group-hover:text-primary/80">
                                                Nhấp để xem câu trả lời
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Back Side */}
                            <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-2 border-green-500/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-green-500/40 hover:-translate-y-1 active:scale-95 transform-gpu">
                                <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div className="space-y-6">
                                        <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 transition-all duration-300 group-hover:bg-green-500/15 group-hover:scale-110">
                                            <Sparkles className="size-8 text-green-500" />
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-medium text-foreground leading-relaxed max-w-md transition-all duration-300 group-hover:text-green-600">
                                                {currentCard.backText}
                                            </h3>
                                            {currentCard.example && (
                                                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-muted-foreground/10 transition-all duration-300 hover:bg-muted/70">
                                                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                                        Ví dụ
                                                    </p>
                                                    <p className="text-sm text-foreground font-medium">
                                                        {currentCard.example}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="w-2 h-2 bg-green-500/40 rounded-full animate-pulse"></div>
                                            <span className="transition-all duration-300 group-hover:text-green-600/80">
                                                Nhấp để xem câu hỏi
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Hint Section */}
                {currentCard.hint && (
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleHint}
                            className="w-full h-10 font-medium transition-all duration-200 hover:bg-yellow-50 hover:border-yellow-300 dark:hover:bg-yellow-950/20"
                        >
                            <Lightbulb className="size-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                            {showHint ? (
                                <>
                                    <EyeOff className="size-4 mr-1" />
                                    Ẩn gợi ý
                                </>
                            ) : (
                                <>
                                    <Eye className="size-4 mr-1" />
                                    Hiển thị gợi ý
                                </>
                            )}
                        </Button>
                        {showHint && (
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg hint-reveal">
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex p-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                        <Lightbulb className="size-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1 uppercase tracking-wide">
                                            Gợi ý
                                        </p>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                                            {currentCard.hint}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={handlePrevCard}
                        disabled={currentCardIndex === 0}
                        className="flex items-center gap-2 h-10 px-4 font-medium transition-all duration-200 disabled:opacity-50"
                    >
                        <ChevronLeft className="size-4" />
                        Trước
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleFlipCard}
                            className="text-xs px-4 py-2 font-medium bg-muted/50 hover:bg-muted transition-colors"
                        >
                            {isFlipped ? (
                                <>
                                    <BookOpen className="size-3 mr-1" />
                                    Xem câu hỏi
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-3 mr-1" />
                                    Xem đáp án
                                </>
                            )}
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleNextCard}
                        disabled={currentCardIndex === totalCards - 1}
                        className="flex items-center gap-2 h-10 px-4 font-medium transition-all duration-200 disabled:opacity-50"
                    >
                        Tiếp
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                {/* Completion Message */}
                {currentCardIndex === totalCards - 1 && (
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="space-y-3">
                            <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Sparkles className="size-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                                    🎉 Xuất sắc!
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Bạn đã hoàn thành tất cả {totalCards} thẻ flashcard
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRestart}
                                className="mt-3 bg-white dark:bg-green-950/50 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                            >
                                <RotateCcw className="size-4 mr-2" />
                                Làm lại từ đầu
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="size-4" />
                        {flashcardsData?.title || "Bộ flashcards"}
                    </DialogTitle>
                    <DialogDescription>
                        Học tập với flashcards tương tác được tạo bởi AI. Nhấp vào thẻ để lật và xem đáp án.
                        <br />
                        <span className="text-xs text-muted-foreground mt-1 inline-block">
                            Phím tắt: ← → (điều hướng), Space/Enter (lật thẻ), H (gợi ý), R (bắt đầu lại)
                        </span>
                    </DialogDescription>
                    {flashcardsData && statusInfo && (
                        <div className="flex items-center gap-2 pt-2">
                            <Badge
                                variant={
                                    statusInfo.tone === "error"
                                        ? "destructive"
                                        : statusInfo.tone === "processing"
                                            ? "secondary"
                                            : "default"
                                }
                            >
                                {statusInfo.label}
                            </Badge>
                            <Badge variant="outline">
                                {flashcardsData.totalFlashcards} thẻ
                            </Badge>
                        </div>
                    )}
                </DialogHeader>

                {renderBody()}
            </DialogContent>
        </Dialog>
    );
}

