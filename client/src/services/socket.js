import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;
  
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  
  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    if (token) {
      socket.emit('authenticate', token);
    }
  });

  socket.on('authenticated', ({ success }) => {
    if (success) console.log('✅ Socket authenticated');
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToTaskEvents = (callbacks) => {
  if (!socket) return;
  if (callbacks.onCreated) socket.on('task:created', callbacks.onCreated);
  if (callbacks.onUpdated) socket.on('task:updated', callbacks.onUpdated);
  if (callbacks.onDeleted) socket.on('task:deleted', callbacks.onDeleted);
  if (callbacks.onReordered) socket.on('tasks:reordered', callbacks.onReordered);
};

export const unsubscribeFromTaskEvents = () => {
  if (!socket) return;
  socket.off('task:created');
  socket.off('task:updated');
  socket.off('task:deleted');
  socket.off('tasks:reordered');
};
