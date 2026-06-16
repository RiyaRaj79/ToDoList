const socketHandler = (io) => {
  // Track connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Authenticate socket with JWT
    socket.on('authenticate', (token) => {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        socket.userId = userId;
        socket.join(`user:${userId}`);
        connectedUsers.set(userId.toString(), socket.id);

        socket.emit('authenticated', { success: true, userId });
        console.log(`✅ Socket authenticated for user: ${userId}`);
      } catch (err) {
        socket.emit('auth_error', { message: 'Invalid token' });
      }
    });

    // Real-time task operations from client
    socket.on('task:update', (data) => {
      if (socket.userId) {
        socket.to(`user:${socket.userId}`).emit('task:updated', data);
      }
    });

    // Pomodoro session events
    socket.on('pomodoro:start', (data) => {
      socket.emit('pomodoro:started', { ...data, startTime: Date.now() });
    });

    socket.on('pomodoro:complete', (data) => {
      socket.emit('pomodoro:completed', data);
    });

    // Notification events
    socket.on('notify', (data) => {
      if (socket.userId) {
        io.to(`user:${socket.userId}`).emit('notification', data);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId.toString());
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = socketHandler;
