export type NumberOfCards = "few" | "standard" | "many";

export interface GenerateFlashcardsResponse {
    aiSetId: string;
    status: "queued" | "processing" | "done" | "failed";
    message: string;
    success: boolean;
}

export interface FlashcardItem {
    id: string;
    frontText: string;
    backText: string;
    hint?: string;
    example?: string;
    imageUrl?: string;
    audioUrl?: string;
    extraMetadata?: Record<string, unknown>;
    createdAt: string;
}

export interface FlashcardListResponse {
    aiSetId: string;
    title?: string;
    status: "queued" | "processing" | "done" | "failed";
    errorMessage?: string | null;
    notebookId: string;
    flashcards: FlashcardItem[];
    totalFlashcards: number;
}

