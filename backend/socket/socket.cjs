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
    console.log('User connected:', socket.id)

    // Lắng nghe sự kiện 'joinRoom'
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room ${roomId}`)
    })

    // Lắng nghe sự kiện rời phòng
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId)
      console.log(`User ${socket.id} left room ${roomId}`)
    })

    // Lắng nghe sự kiện gửi tin nhắn
    socket.on('sendMessage', async (message, ack) => {
      try {
        const { roomId, senderId, content, media, replyTo } = message
        console.log(replyTo)

        // Tạo tin nhắn mới
        const newMessage = await MessageService.createMessage({
          params: { roomId },
          body: { senderId, content, media, replyTo }
        })

        console.log('New message:', newMessage)

        // Phát lại tin nhắn đến tất cả các client trong phòng
        io.to(roomId).emit('receiveMessage', newMessage)

        const updatedRoom = await RoomService.updateRoom({ roomId, lastMessage: content })

        console.log('Updated room:', updatedRoom)

        const members = updatedRoom.members

        // Phát lại tin nhắn đến các client là thành viên trong phòng
        members.forEach((member) => {
          io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
        })

        // Gửi acknowledgement cho client
        if (ack) {
          ack({ success: true, message: 'Message sent successfully!' })
        }
      } catch (error) {
        console.error('Error handling message:', error)

        // Gửi thông báo lỗi cho client qua acknowledgement
        if (ack) {
          ack({ success: false, message: error.message })
        }
      }
    })

    //Lắng nghe sự kiện gửi thông báo đang nhập tin nhắn
    socket.on('sendNotifyTyping', async (notify, ack) => {
      try {
        const { roomId, senderId, senderName, isTyping } = notify

        // Phát lại tin nhắn đến tất cả các client trong phòng
        io.to(roomId).emit('receiveNotifyTyping', { senderId, senderName, isTyping })

        // Gửi acknowledgement cho client
        if (ack) {
          ack({ success: true, message: 'Notify sent successfully!' })
        }
      } catch (error) {
        console.error('Error handling notify:', error)

        // Gửi thông báo lỗi cho client qua acknowledgement
        if (ack) {
          ack({ success: false, message: error.message })
        }
      }
    })

    //Lắng nghe sự kiện xoá tin nhắn
    socket.on('deleteMessage', async (message, ack) => {
      try {
        const { roomId, messageId } = message

        // Xóa tin nhắn bằng dịch vụ
        const deletedMessage = await MessageService.deleteMessage(messageId)

        console.log('Deleted message:', deletedMessage)

        // Phát lại sự kiện xóa tin nhắn đến tất cả các client trong phòng
        io.to(roomId).emit('receiveDeletedMessage', deletedMessage)

        //Nếu là tin nhắn gần nhất, thì cập nhật lại tin nhắn cuối cùng của phòng
        const isRecentlyMessage = await MessageService.isRecentlyMessage(roomId, messageId)

        if (isRecentlyMessage) {
          const updatedRoom = await RoomService.updateRoom({
            roomId,
            lastMessage: 'Tin nhắn đã bị xóa'
          })
          const members = updatedRoom.members

          members.forEach((member) => {
            console.log(member.userId.toString())
            io.to(member.userId.toString()).emit('receiveLastMessage', updatedRoom)
          })
        }

        // Trả về acknowledgement thành công cho client
        if (ack) ack({ success: true, message: 'Message deleted successfully!' })
      } catch (error) {
        console.error('Error handling message:', error)

        // Trả về acknowledgement thất bại cho client
        if (ack) ack({ success: false, message: error.message })
      }
    })

    //Lắng nghe sự kiện cập nhật phòng
    socket.on('updateRoom', async (roomInfo, ack) => {
      try {
        const updatedRoom = await RoomService.updateRoom(roomInfo)

        console.log('Updated room:', updatedRoom)

        const members = updatedRoom.members

        // Phát lại tin nhắn đến các client là thành viên trong phòng
        members.forEach((member) => {
          io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
        })

        // Trả về acknowledgement thành công cho client
        if (ack) ack({ success: true, message: 'Room updated successfully!' })
      } catch (error) {
        console.error('Error update message:', error)

        // Trả về acknowledgement thất bại cho client
        if (ack) ack({ success: false, message: error.message })
      }
    })

    //Lắng nghe sự kiện xoá thành viên khỏi phòng
    socket.on('removeMemberFromRoom', async (roomInfo, ack) => {
      try {
        const { memberId } = roomInfo
        const updatedRoom = await RoomService.removeMemberFromRoom(roomInfo)

        console.log('Updated room:', updatedRoom)

        const members = updatedRoom.members

        // Phát lại tin nhắn đến các client là thành viên trong phòng
        members.forEach((member) => {
          io.to(member.userId.toString()).emit('receiveUpdatedRoom', updatedRoom)
        })

        // Phát lại tin nhắn đến thành viên rời khỏi phòng
        io.to(memberId).emit('receiveLeavedRoom', updatedRoom)

        // Trả về acknowledgement thành công cho client
        if (ack) ack({ success: true, message: 'Room updated successfully!' })
      } catch (error) {
        console.error('Error update message:', error)

        // Trả về acknowledgement thất bại cho client
        if (ack) ack({ success: false, message: error.message })
      }
    })

    //Lắng nghe sự kiện rời phòng
    socket.on('leavePublicRoom', async (roomInfo, ack) => {
      try {
        const { userId } = roomInfo

        const updatedRoom = await RoomService.leaveRoom(roomInfo)

        console.log('Updated room:', updatedRoom)

        // Phát lại tin nhắn đến các client là thành viên trong phòng
        io.to(userId).emit('receiveLeavedRoom', updatedRoom)

        // Trả về acknowledgement thành công cho client
        if (ack) ack({ success: true, message: 'Room updated successfully!' })
      } catch (error) {
        console.error('Error update message:', error)

        // Trả về acknowledgement thất bại cho client
        if (ack) ack({ success: false, message: error.message })
      }
    })

    //Lắng nghe sự kiện có cuộc gọi đến
    socket.on('incomingCall', async ({ url, userIdsToRing }, ack) => {
      try {
        userIdsToRing.forEach((userId) => io.to(userId).emit('receiveIncomingCall', url))

        // Trả về acknowledgement thành công cho client
        if (ack) ack({ success: true, message: 'Phone ringing!' })
      } catch (error) {
        console.error('Error ringing phone:', error)

        // Trả về acknowledgement thất bại cho client
        if (ack) ack({ success: false, message: error.message })
      }
    })

    // Lắng nghe sự kiện gửi thông tin của người nghe
    socket.on('sendReceiverPeerId', async ({ peerId, callerId }, ack) => {
      try {
        // Gửi cho người gọi thông tin của người nhận
        io.to(callerId).emit('receiveReceiverPeerId', peerId)

        // Trả về ack thành công
        if (ack) ack({ success: true, message: 'PeerId sent successfully!' })
      } catch (error) {
        console.error('Error joining call room:', error)
        if (ack) ack({ success: false, message: error.message })
      }
    })

    // Lắng nghe sự kiện 'disconnect'
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id)
    })
  })

  return io
}

module.exports = setupSocket
