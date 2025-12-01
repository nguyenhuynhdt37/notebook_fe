export interface UserInfo {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
}

export interface Reaction {
    id: string;
    emoji: string;
    user: UserInfo;
    createdAt: string;
}

export interface Message {
    id: string;
    user: UserInfo | null;
    content: string;
    replyToMessageId: string | null;
    reactions: Reaction[];
    createdAt: string;
}

export interface SendMessageRequest {
    content: string;
    replyToMessageId?: string | null;
}

export interface ReactRequest {
    messageId: string;
    emoji: string;
}

export interface ReactionUpdate {
    messageId: string;
    reaction: Reaction | null;
    action: "added" | "removed";
}

export interface TypingNotification {
    userId: string;
    user: UserInfo;
    isTyping: boolean;
}

export interface ChatHistoryResponse {
    content: Message[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
}

