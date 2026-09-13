/**
 * src/hooks/useChat.js
 *
 * Composite hook — bundles WebSocket real-time events + REST API calls
 * into a single clean interface for chat components.
 *
 * Usage:
 *   const chat = useChat();
 *   await chat.loadConversations();
 *   chat.sendMessage(convId, "Hello!");
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { connectChat, disconnectChat } from "./useChatSocket";
import {
  getConversationsApi,
  getMessagesApi,
  sendChatMessageApi,
  markAsReadApi,
  getUnreadCountApi,
  deleteMessageApi,
  createOrGetConversationApi,
} from "../api/chatApi";

export function useChat() {
  const clientRef = useRef(null);
  const subsRef = useRef({});            // active subscriptions keyed by "conv-{id}"
  const pendingSubsRef = useRef({});     // queued subscriptions keyed by "conv-{id}"
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [wsError, setWsError] = useState(null);

  // Authenticate based on Redux profile state.
  // HttpOnly cookie is automatically included in the WebSocket handshake.
  const user = useSelector((state) => state.auth.profile);

  // ── Helper to execute actual STOMP subscriptions on a connected client ─────
  const doSubscribe = useCallback((client, conversationId, handlers) => {
    if (!client || !client.active) return;

    const key = `conv-${conversationId}`;
    // If already subscribed, unsubscribe previous listeners first
    if (subsRef.current[key]) {
      subsRef.current[key].forEach((s) => { try { s.unsubscribe(); } catch { /* ignore */ } });
      delete subsRef.current[key];
    }

    const subs = [];
    const safeParse = (msg) => { try { return JSON.parse(msg.body); } catch { return null; } };

    subs.push(
      client.subscribe(`/topic/conversations/${conversationId}`, (msg) => {
        const data = safeParse(msg);
        if (data) handlers.onMessage?.(data);
      })
    );

    subs.push(
      client.subscribe(`/topic/conversations/${conversationId}/typing`, (msg) => {
        const data = safeParse(msg);
        if (data) handlers.onTyping?.(data);
      })
    );

    subs.push(
      client.subscribe(`/topic/conversations/${conversationId}/read`, (msg) => {
        const data = safeParse(msg);
        if (data) handlers.onRead?.(data);
      })
    );

    subs.push(
      client.subscribe(`/topic/conversations/${conversationId}/presence`, (msg) => {
        const data = safeParse(msg);
        if (data) handlers.onPresence?.(data);
      })
    );

    subsRef.current[key] = subs;
  }, []);

  // ── Connect on mount / when user is authenticated ──────────────────────────
  useEffect(() => {
    if (!user) {
      disconnectChat();
      setConnected(false);
      setConnectionStatus("DISCONNECTED");
      return;
    }

    setConnectionStatus("CONNECTING");

    connectChat(
      (stompClient) => {
        clientRef.current = stompClient;
        setConnected(true);
        setConnectionStatus("CONNECTED");
        setWsError(null);

        // Subscribe to personal server-push error queue
        stompClient.subscribe("/user/queue/errors", (msg) => {
          try {
            const err = JSON.parse(msg.body);
            console.error("[Chat] Server error:", err);
            setWsError(err?.message || "Chat error occurred");
          } catch {
            // ignore parse errors
          }
        });

        // Automatically activate any queued subscriptions (e.g. conversation opened before connect)
        Object.entries(pendingSubsRef.current).forEach(([cId, handlers]) => {
          doSubscribe(stompClient, cId, handlers);
        });
      },
      (err) => {
        console.warn("[Chat] WebSocket connection failed — REST-only mode:", err?.message || err);
        setConnected(false);
        setConnectionStatus("ERROR");
        setWsError("WebSocket unavailable — messages will still load and send via REST.");
      },
      (status) => {
        setConnectionStatus(status);
        if (status === "CONNECTED") {
          setConnected(true);
          setWsError(null);
        } else if (status === "DISCONNECTED" || status === "ERROR") {
          setConnected(false);
        }
      }
    );

    return () => {
      // Unsubscribe all active subscriptions before disconnect
      Object.values(subsRef.current).forEach((subs) =>
        subs.forEach((s) => { try { s.unsubscribe(); } catch { /* ignore */ } })
      );
      subsRef.current = {};
      disconnectChat();
      setConnected(false);
      setConnectionStatus("DISCONNECTED");
    };
  }, [user, doSubscribe]);

  // ── Subscribe to a conversation (Queued / Resilient) ─────────────────────
  /**
   * Call this when the user opens a chat window.
   * Stores handlers in pendingSubsRef so subscription is guaranteed even if socket is reconnecting.
   */
  const subscribeToConversation = useCallback(
    (conversationId, handlers) => {
      pendingSubsRef.current[conversationId] = handlers;
      if (clientRef.current && connected) {
        doSubscribe(clientRef.current, conversationId, handlers);
      }
    },
    [connected, doSubscribe]
  );

  // ── Unsubscribe when user closes the chat window ─────────────────────────
  const unsubscribeFromConversation = useCallback((conversationId) => {
    delete pendingSubsRef.current[conversationId];
    const key = `conv-${conversationId}`;
    const subs = subsRef.current[key];
    if (subs) {
      subs.forEach((s) => { try { s.unsubscribe(); } catch { /* ignore */ } });
      delete subsRef.current[key];
    }
  }, []);

  // ── Dual-Transport Send Message (WebSocket + Guaranteed REST Fallback) ──
  const sendMessage = useCallback(async (conversationId, content) => {
    const trimmed = (content || "").trim();
    if (!trimmed || !conversationId) return { success: false, error: "Empty message" };

    // 1. Try WebSocket if connected
    if (clientRef.current && connected) {
      try {
        clientRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify({ conversationId: Number(conversationId), content: trimmed }),
        });
        return { success: true, via: "websocket" };
      } catch (wsErr) {
        console.warn("[Chat] WebSocket send error, falling back to REST:", wsErr?.message);
      }
    }

    // 2. Reliable REST Fallback (works 100% of the time, even during reconnects)
    try {
      const serverMsg = await sendChatMessageApi(conversationId, trimmed);
      return { success: true, via: "rest", data: serverMsg };
    } catch (restErr) {
      console.error("[Chat] REST send error:", restErr?.response?.data?.message || restErr?.message);
      return {
        success: false,
        error: restErr?.response?.data?.message || "Failed to send message. Please try again.",
      };
    }
  }, [connected]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!clientRef.current || !connected) return;
    try {
      clientRef.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify({ conversationId: Number(conversationId), typing: isTyping }),
      });
    } catch {
      // Ephemeral typing indicator — ignore failures
    }
  }, [connected]);

  // ── Mark as read (REST + WebSocket broadcast) ─────────────────────────────
  const markAsRead = useCallback(async (conversationId) => {
    try {
      // REST: persist lastReadAt in DB
      await markAsReadApi(conversationId);
    } catch {
      // Non-critical — ignore
    }
    // WebSocket: broadcast read receipt to other participant
    if (clientRef.current && connected) {
      clientRef.current.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({ conversationId, content: "" }),
      });
    }
  }, [connected]);

  // ── REST helpers ──────────────────────────────────────────────────────────
  const loadConversations = useCallback(() => getConversationsApi(), []);

  const createOrGetConversation = useCallback(
    (participantId, jobApplicationId = null) =>
      createOrGetConversationApi(participantId, jobApplicationId),
    []
  );

  const loadMessages = useCallback(
    (conversationId, page = 0) => getMessagesApi(conversationId, page),
    []
  );

  const deleteMessage = useCallback(
    (conversationId, messageId) => deleteMessageApi(conversationId, messageId),
    []
  );

  const getUnreadCount = useCallback(() => getUnreadCountApi(), []);

  return {
    connected,
    connectionStatus,
    wsError,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    loadConversations,
    createOrGetConversation,
    loadMessages,
    deleteMessage,
    getUnreadCount,
  };
}
