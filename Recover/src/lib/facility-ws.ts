/**
 * Facility real-time connection (patient side).
 *
 * Opens a WebSocket to the facility backend and authenticates with the
 * patient's access token (via an `auth` message — the same protocol the
 * clinician app uses). When a counselor message arrives (`message.new`) it
 * refreshes the inbox so the patient sees replies without manual refresh.
 *
 * The backend only pushes to patients today (`message.new`); check-in/alert
 * events are clinician-bound. This is intentionally minimal and reconnects
 * with exponential backoff.
 */

import { useFacilityStore } from '@/stores/useFacilityStore';
import { fetchMessages } from './facility-api';

function getWsUrl(): string {
  const api =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FACILITY_API_URL) ||
    'http://localhost:8000/api/v1';
  // The WebSocket endpoint is mounted at the server root (/ws), not under /api/v1.
  const root = api.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  return root.replace(/^http/, 'ws') + '/ws';
}

const MAX_RECONNECT_ATTEMPTS = 10;

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let intentionalClose = false;

function scheduleReconnect(): void {
  if (reconnectTimer || intentionalClose || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;
  reconnectAttempts++;
  const delay = Math.min(1000 * 2 ** (reconnectAttempts - 1), 30000);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectFacilityWebSocket();
  }, delay);
}

/** Open (or re-open) the facility real-time connection. No-op without a token. */
export function connectFacilityWebSocket(): void {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }
  const token = useFacilityStore.getState().accessToken;
  if (!token) return;

  intentionalClose = false;

  try {
    socket = new WebSocket(getWsUrl());
  } catch {
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    reconnectAttempts = 0;
    socket?.send(JSON.stringify({ type: 'auth', data: { token } }));
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'ping') {
        socket?.send(JSON.stringify({ type: 'pong' }));
        return;
      }
      if (msg.type === 'message.new') {
        // A counselor message arrived — refresh the inbox.
        void fetchMessages();
      }
    } catch {
      // ignore malformed frames
    }
  };

  socket.onclose = () => {
    socket = null;
    if (!intentionalClose) scheduleReconnect();
  };

  socket.onerror = () => {
    // onclose will follow and handle reconnect
  };
}

/** Close the facility real-time connection (e.g., on disconnect/logout). */
export function disconnectFacilityWebSocket(): void {
  intentionalClose = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempts = 0;
  if (socket) {
    socket.close(1000, 'client disconnect');
    socket = null;
  }
}
