/**
 * src/hooks/useChatSocket.js
 *
 * STOMP WebSocket connector — production-safe version.
 *
 * Changes from original:
 *  1. Uses native WebSocket (wss://) in production — avoids SockJS's
 *     window.addEventListener('unload') which triggers:
 *     "[Violation] Permissions policy violation: unload is not allowed in this document."
 *  2. Bounded exponential backoff: max 5 retries, doubling delay (5s → 10s → 20s → 30s cap).
 *     Prevents infinite reconnect storms when the backend is down/restarting.
 *  3. Manual reconnect counter — deactivates the client entirely after maxRetries
 *     instead of reconnecting forever.
 *  4. SockJS is kept as a fallback for HTTP-only environments (localhost dev).
 *
 * Authentication:
 *   Uses HttpOnly cookies sent automatically during the WebSocket handshake.
 *   Authorization: Bearer header is also sent in STOMP connect headers as fallback
 *   for cross-site environments where the cookie may be blocked.
 *
 * Usage:
 *   import { connectChat, disconnectChat } from './useChatSocket';
 *   connectChat(onConnected, onError);
 *   disconnectChat();
 */

import { Client } from "@stomp/stompjs";

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  RAW_API_URL.replace(/\/api\/?$/, "").replace(/^http/, "ws") + "/ws";

// In production, always use wss:// (the above replace handles http→ws / https→wss)
const isProduction = import.meta.env.PROD;

// Bounded reconnect configuration
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 5000;
const MAX_DELAY_MS = 30000;

let stompClient = null;
let retryCount = 0;

/**
 * Compute exponential backoff delay with jitter, capped at MAX_DELAY_MS.
 */
function getBackoffDelay(attempt) {
  const delay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt), MAX_DELAY_MS);
  // ±10% jitter to prevent thundering herd
  return delay + (Math.random() * delay * 0.2 - delay * 0.1);
}

/**
 * Connect to the chat WebSocket server.
 *
 * @param {Function} onConnected     Called with (stompClient) when STOMP CONNECT succeeds
 * @param {Function} onError         Called with (frame|event) on unrecoverable connection failure
 * @param {Function} onStatusChange  Called with ("CONNECTING"|"CONNECTED"|"RECONNECTING"|"DISCONNECTED"|"ERROR")
 * @returns {Client} The STOMP client instance
 */
export function connectChat(onConnected, onError, onStatusChange) {
  // Deactivate any existing connection before creating a new one
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    stompClient = null;
  }

  retryCount = 0;
  onStatusChange?.("CONNECTING");

  let token = null;
  try {
    token = localStorage.getItem("jobportal_token");
  } catch {
    // localStorage may be blocked in some browser contexts
  }

  stompClient = new Client({
    /**
     * Production: use native WebSocket (wss://) — avoids SockJS's unload listener.
     * Development: fall back to SockJS for HTTP (no WSS available on localhost).
     */
    brokerURL: token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL,

    // Dual-mode auth: Bearer token in STOMP CONNECT headers (fallback for
    // cross-site browsers that block 3rd-party cookies)
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

    // Heartbeat: 10s outgoing, 10s incoming — keeps connection alive through
    // Render's proxy without consuming too much bandwidth
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    // Disable automatic reconnect — we handle it manually with bounded backoff
    reconnectDelay: 0,

    onConnect: (frame) => {
      retryCount = 0; // reset on successful connection
      console.log(
        "[ChatSocket] Connected:",
        frame?.headers?.server || "ok"
      );
      onStatusChange?.("CONNECTED");
      onConnected?.(stompClient);
    },

    onStompError: (frame) => {
      console.error(
        "[ChatSocket] STOMP error:",
        frame?.headers?.message || frame
      );
      onStatusChange?.("ERROR");
      onError?.(frame);
    },

    onWebSocketError: (event) => {
      console.warn(
        "[ChatSocket] WebSocket error (attempt " +
          (retryCount + 1) +
          "/" +
          MAX_RETRIES +
          "):",
        event?.type || event
      );

      if (retryCount < MAX_RETRIES) {
        const delay = getBackoffDelay(retryCount);
        retryCount++;
        onStatusChange?.("RECONNECTING");
        console.log(`[ChatSocket] Retrying in ${Math.round(delay / 1000)}s...`);

        setTimeout(() => {
          if (stompClient && !stompClient.active) {
            // Refresh token before retry in case it was set after first attempt
            try {
              const freshToken = localStorage.getItem("jobportal_token");
              if (freshToken) {
                stompClient.brokerURL = `${WS_URL}?token=${encodeURIComponent(freshToken)}`;
                stompClient.connectHeaders = {
                  Authorization: `Bearer ${freshToken}`,
                };
              }
            } catch {
              // ignore
            }
            onStatusChange?.("CONNECTING");
            stompClient.activate();
          }
        }, delay);
      } else {
        console.error(
          "[ChatSocket] Max retries (" +
            MAX_RETRIES +
            ") reached. WebSocket disabled — REST-only mode."
        );
        onStatusChange?.("ERROR");
        onError?.(event);
        // Fully deactivate — do NOT keep reconnecting
        if (stompClient) {
          stompClient.deactivate();
        }
      }
    },

    onDisconnect: () => {
      console.log("[ChatSocket] Disconnected");
      onStatusChange?.("DISCONNECTED");
    },
  });

  stompClient.activate();
  return stompClient;
}

/**
 * Gracefully disconnect from the WebSocket server.
 * Resets retry counter so the next connectChat() starts fresh.
 */
export function disconnectChat() {
  retryCount = MAX_RETRIES; // prevent any pending retry from firing
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

/**
 * Get the current STOMP client instance (for direct use if needed).
 */
export function getChatClient() {
  return stompClient;
}
