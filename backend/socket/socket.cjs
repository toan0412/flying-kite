const socketIO = require('socket.io');
const MessageService = require('../services/message.service.cjs');
const RoomService = require('../services/room.service.cjs');

function setupSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Lắng nghe sự kiện 'joinRoom'
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Lắng nghe sự kiện 'leaveRoom'
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    // Lắng nghe sự kiện 'sendMessage'
    socket.on('sendMessage', async (message, ack) => {
      try {
        // Destructure message object
        const { roomId, senderId, content, media } = message;

        // Tạo tin nhắn mới
        const newMessage = await MessageService.createMessage({
          params: { roomId },
          body: { senderId, content, media },
        });

        console.log('New message:', newMessage);

        // Phát lại tin nhắn đến tất cả các client trong phòng
        io.to(roomId).emit('receiveMessage', newMessage);

        // Gửi acknowledgement cho client
        if (ack) {
          ack({ success: true, message: 'Message sent successfully!' });
        }
      } catch (error) {
        console.error('Error handling message:', error);

        // Gửi thông báo lỗi cho client qua acknowledgement
        if (ack) {
          ack({ success: false, message: error.message });
        }
      }
    });


    socket.on('sendLastMessage', async (message, ack) => {
      try {
        const { roomId, lastMessage } = message;

        // Cập nhật tin nhắn cuối cùng của phòng
        const updatedRoom = await RoomService.updateRoom({ roomId, lastMessage });

        console.log('Updated room:', updatedRoom);

        const members = updatedRoom.members

        // Phát lại tin nhắn đến các client là thành viên trong phòng
        members.forEach(member => {
          console.log(member.userId.toString())
          io.to(member.userId.toString()).emit('receiveLastMessage', updatedRoom)
        });

        // Gửi acknowledgement cho client (nếu cần)
        if (ack) ack({ success: true, message: 'Last message updated successfully!' })
      } catch (error) {
        console.error('Error handling message:', error)

        // Gửi thông báo lỗi cho client qua acknowledgement
        if (ack) ack({ success: false, message: error.message })
      }
    });

    socket.on('deleteMessage', async (message, ack) => {
      try {
        const { roomId, messageId } = message;

        // Xóa tin nhắn bằng dịch vụ
        const deletedMessage = await MessageService.deleteMessage(messageId);

        console.log('Deleted message:', deletedMessage);

        // Phát lại sự kiện xóa tin nhắn đến tất cả các client trong phòng
        io.to(roomId).emit('receiveDeletedMessage', deletedMessage);

        // Trả về acknowledgement thành công cho client
        if (ack) ack({ success: true, message: 'Message deleted successfully!' });
      } catch (error) {
        console.error('Error handling message:', error);

        // Trả về acknowledgement thất bại cho client
        if (ack) ack({ success: false, message: error.message });
      }
    });


    // Lắng nghe sự kiện 'disconnect'
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
