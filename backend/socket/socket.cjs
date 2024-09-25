const socketIO = require('socket.io')
const MessageService = require('../services/message.service.cjs')
const RoomService = require('../services/room.service.cjs')

function setupSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    /**
     * Xử lý sự kiện khi người dùng tham gia phòng
     */
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
    })

    /**
     * Xử lý sự kiện khi người dùng rời phòng
     */
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId)
    })

    /**
     * Xử lý sự kiện gửi tin nhắn
     */
    socket.on('sendMessage', async (message, ack) => {
      try {
        const { roomId, senderId, content, media, replyTo } = message

        const newMessage = await MessageService.createMessage({
          params: { roomId },
          body: { senderId, content, media, replyTo }
        })

        io.to(roomId).emit('receiveMessage', newMessage)

        const lastMessage = content || 'Phương tiện'
        const updatedRoom = await RoomService.updateRoom({ roomId, userId: senderId, lastMessage })

        updatedRoom.members.forEach((member) => {
          if (member.role !== 'left') {
            io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
          }
        })

        if (ack) ack({ success: true, message: 'Message sent successfully!' })
      } catch (error) {
        console.error('Error handling message:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện thông báo đang nhập tin nhắn
     */
    socket.on('sendNotifyTyping', async (notify, ack) => {
      try {
        const { roomId, senderId, senderName, isTyping } = notify
        io.to(roomId).emit('receiveNotifyTyping', { senderId, senderName, isTyping })
        if (ack) ack({ success: true, message: 'Notify sent successfully!' })
      } catch (error) {
        console.error('Error handling notify:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện xóa tin nhắn
     */
    socket.on('deleteMessage', async (message, ack) => {
      try {
        const { roomId, userId, messageId } = message
        const deletedMessage = await MessageService.deleteMessage(messageId)

        io.to(roomId).emit('receiveDeletedMessage', deletedMessage)

        const isRecentlyMessage = await MessageService.isRecentlyMessage(roomId, messageId)
        if (isRecentlyMessage) {
          const updatedRoom = await RoomService.updateRoom({
            roomId,
            userId,
            lastMessage: 'Tin nhắn đã bị xóa'
          })

          updatedRoom.members.forEach((member) => {
            if (member.role !== 'left') {
              io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
            }
          })
        }

        if (ack) ack({ success: true, message: 'Message deleted successfully!' })
      } catch (error) {
        console.error('Error handling message deletion:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện cập nhật phòng
     */
    socket.on('updateRoom', async (roomInfo, ack) => {
      try {
        const updatedRoom = await RoomService.updateRoom(roomInfo)
        updatedRoom.members.forEach((member) => {
          if (member.role !== 'left') {
            io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
          }
        })
        if (ack) ack({ success: true, message: 'Room updated successfully!' })
      } catch (error) {
        console.error('Error updating room:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện xóa thành viên khỏi phòng
     */
    socket.on('removeMemberFromRoom', async (roomInfo, ack) => {
      try {
        const updatedRoom = await RoomService.removeMemberFromRoom(roomInfo)
        updatedRoom.members.forEach((member) => {
          if (member.role !== 'left') {
            io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
          }
        })
        if (ack) ack({ success: true, message: 'Member removed successfully!' })
      } catch (error) {
        console.error('Error removing member:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện rời phòng công khai
     */
    socket.on('leavePublicRoom', async (roomInfo, ack) => {
      try {
        const { userId } = roomInfo
        const updatedRoom = await RoomService.leaveRoom(roomInfo)
        updatedRoom.members.forEach((member) => {
          if (member.role !== 'left') {
            io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
          }
        })
        io.to(userId).emit('receiveUpdatedRoom', updatedRoom)
        if (ack) ack({ success: true, message: 'Left room successfully!' })
      } catch (error) {
        console.error('Error leaving room:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện có cuộc gọi đến
     */
    socket.on('incomingCall', async ({ url, userIdsToRing }, ack) => {
      try {
        userIdsToRing.forEach((userId) => io.to(userId).emit('receiveIncomingCall', url))
        if (ack) ack({ success: true, message: 'Call initiated successfully!' })
      } catch (error) {
        console.error('Error initiating call:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện gửi thông tin của người nhận cuộc gọi
     */
    socket.on('sendReceiverPeerId', async ({ peerId, callerId }, ack) => {
      try {
        io.to(callerId).emit('receiveReceiverPeerId', peerId)
        if (ack) ack({ success: true, message: 'PeerId sent successfully!' })
      } catch (error) {
        console.error('Error sending PeerId:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    /**
     * Xử lý sự kiện ngắt kết nối
     */
    socket.on('disconnect', () => {
      // Có thể thêm xử lý khi người dùng ngắt kết nối nếu cần
    })
  })

  return io
}

module.exports = setupSocket
