import { Client } from "@stomp/stompjs";

export async function connectWebSocket(
  endpoint: string, // ví dụ: "/ws" (STOMP endpoint)
  token?: string,
  role_name?: string | null,
  onMessage?: (data: any) => void,
  onClose?: (event: CloseEvent) => void
): Promise<Client> {
  const base = process.env.NEXT_PUBLIC_URL_BACKEND_WS || "ws://127.0.0.1:8386";

  // ✅ Ghép URL chính xác
  const wsUrl =
    token && role_name
      ? `${base}${endpoint}?access_token=${encodeURIComponent(
          token
        )}&role_name=${encodeURIComponent(role_name)}`
      : token
      ? `${base}${endpoint}?access_token=${encodeURIComponent(token)}`
      : `${base}${endpoint}`;

  console.log("🔌 Connecting WebSocket:", wsUrl);

  return new Promise((resolve, reject) => {
    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {},
      debug: function (str) {
        console.log("STOMP:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("✅ WebSocket connected:", endpoint);
      resolve(client);
    };

    client.onStompError = (frame) => {
      console.error("⚡ STOMP error:", frame);
      reject(new Error(frame.headers["message"]));
    };

    client.onWebSocketClose = (event) => {
      console.warn(
        `🔴 WS closed (${endpoint}):`,
        event.code,
        event.reason || "no reason"
      );
      onClose?.(event);
    };

    client.activate();
  });
}
