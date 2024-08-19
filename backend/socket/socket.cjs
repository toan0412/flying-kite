const socketIO = require('socket.io');
const MessageService = require('../services/message.service.cjs')
const RoomService = require('../services/room.service.cjs')

function setupSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('user connected');

    // Lắng nghe sự kiện 'sendMessage'
    socket.on('sendMessage', async (message, ack) => {
      try {
        const { roomId, senderId, content } = message;

        // Tạo tin nhắn mới
        const newMessage = await MessageService.createMessage({
          params: { roomId },
          body: { senderId, content },
        });

        console.log('New message:', newMessage);

        // Phát lại tin nhắn đến tất cả các client trong phòng
        io.to(roomId).emit('receiveMessage', newMessage);

        // Gửi acknowledgement cho client (nếu cần)
        if (ack) ack({ success: true, message: 'Message sent successfully!' });
      } catch (error) {
        console.error('Error handling message:', error);

        // Gửi thông báo lỗi cho client qua acknowledgement
        if (ack) ack({ success: false, message: error.message });
      }
    });


    socket.on('sendLastMessage', async (message, ack) => {
      try {
        const { roomId, lastMessage } = message;

        // Lấy tin nhắn cuối cùng của phòng
        const updateRoom = await RoomService.updateRoom({
          roomId, lastMessage
        });

        console.log('update room', updateRoom);

        // Phát lại tin nhắn đến tất cả các client khác trong cùng một room
        socket.to(roomId).emit('receiveLastMessage', updateRoom);

        // Gửi acknowledgement cho client (nếu cần)
        if (ack) ack({ success: true, message: 'Message sent successfully!' });
      } catch (error) {
        console.error('Error handling message:', error);

        // Gửi thông báo lỗi cho client qua acknowledgement
        if (ack) ack({ success: false, message: error.message });
      }
    });


    // Lắng nghe sự kiện disconnect
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  return io;
}

module.exports = setupSocket;
