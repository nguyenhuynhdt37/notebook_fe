import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const backendUrl =
    process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8386";

export interface WebSocketConfig {
    token: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

export class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private config: WebSocketConfig | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    connect(config: WebSocketConfig): void {
        this.config = config;

        if (this.client?.connected) {
            return;
        }

        this.client = new Client({
            webSocketFactory: () => {
                return new SockJS(`${backendUrl}/ws?token=${config.token}`) as any;
            },
            reconnectDelay: this.reconnectDelay,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                this.reconnectAttempts = 0;
                this.config?.onConnect?.();
            },
            onDisconnect: () => {
                this.config?.onDisconnect?.();
            },
            onStompError: (frame) => {
                const error = new Error(
                    `STOMP error: ${frame.headers["message"] || "Unknown error"}`
                );
                this.config?.onError?.(error);
            },
            onWebSocketError: (event) => {
                const error = new Error("WebSocket connection error");
                this.config?.onError?.(error);
            },
        });

        this.client.activate();
    }

    disconnect(): void {
        this.unsubscribeAll();
        if (this.client?.connected) {
            this.client.deactivate();
        }
        this.client = null;
        this.config = null;
    }

    subscribe(
        destination: string,
        callback: (message: IMessage) => void
    ): () => void {
        if (!this.client?.connected) {
            console.warn("WebSocket not connected, cannot subscribe");
            return () => { };
        }

        const subscription = this.client.subscribe(destination, callback);
        this.subscriptions.set(destination, subscription);

        return () => {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        };
    }

    unsubscribe(destination: string): void {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
    }

    send(destination: string, body: any): void {
        if (!this.client?.connected) {
            console.warn("WebSocket not connected, cannot send message");
            return;
        }

        this.client.publish({
            destination,
            body: JSON.stringify(body),
        });
    }

    isConnected(): boolean {
        return this.client?.connected ?? false;
    }
}

let websocketInstance: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
    if (!websocketInstance) {
        websocketInstance = new WebSocketService();
    }
    return websocketInstance;
}

