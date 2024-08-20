import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const socket = io(backendUrl);

const ChatService = {
  joinRoom(roomId) {
    socket.emit('joinRoom', roomId);
  },

  leaveRoom(roomId) {
    socket.emit('leaveRoom', roomId);
  },

  sendMessage(message, callback) {
    socket.emit('sendMessage', message, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack);
      } else {
        console.error('Error sending message:', ack.message);
        if (callback) callback(new Error(ack.message), null);
      }
    });
  },

  onMessageReceived(callback) {
    socket.on('receiveMessage', callback);
  },

  setLastMessage(message, callback) {
    const { roomId, content } = message;
    socket.emit('sendLastMessage', { roomId, lastMessage: content }, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack);
      } else {
        console.error('Error updating last message:', ack.message);
        if (callback) callback(new Error(ack.message), null);
      }
    });
  },

  onLastMessageReceived(callback) {
    socket.on('receiveLastMessage', callback);
  },
};

export default ChatService;
