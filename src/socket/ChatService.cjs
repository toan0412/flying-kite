import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const socket = io(backendUrl);

const ChatService = {
  
  sendMessage(message, callback) {
    socket.emit('sendMessage', message, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack); // Thực hiện callback với kết quả thành công
      } else {
        console.error('Error sending message:', ack.message);
        if (callback) callback(new Error(ack.message), null); // Thực hiện callback với lỗi
      }
    })
  },

  onMessageReceived(callback) {
    socket.on('receiveMessage', callback);
  },

  setLastMessage(message, callback) {
    const { roomId, content } = message
    socket.emit('sendLastMessage', { roomId: roomId, lastMessage: content }, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack); // Thực hiện callback với kết quả thành công
      } else {
        console.error('Error sending message:', ack.message);
        if (callback) callback(new Error(ack.message), null); // Thực hiện callback với lỗi
      }
    })
  },

  onLastMessageReceived(callback) {
    socket.on('receiveLastMessage', callback);
  },
};

export default ChatService;
