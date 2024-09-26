const MessageService = require('../../services/message.service.cjs')
const RoomService = require('../../services/room.service.cjs')
const { emitUpdatedRoom, handleSocketError } = require('../utils/socketHelpers.cjs')

function initializeMessageHandlers(io, socket) {
  socket.on('message:send', async (message, ack) => {
    try {
      const { roomId, senderId, content, media, replyTo } = message

      const newMessage = await MessageService.createMessage({
        params: { roomId },
        body: { senderId, content, media, replyTo }
      })

      io.to(roomId).emit('message:receive', newMessage)

      const lastMessage = content || 'Media'
      const updatedRoom = await RoomService.updateRoom({ roomId, userId: senderId, lastMessage })

      emitUpdatedRoom(io, updatedRoom)

      if (ack) ack({ success: true, message: 'Message sent successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error handling message:')
    }
  })

  socket.on('typing:notify', async (notify, ack) => {
    try {
      const { roomId, senderId, senderName, isTyping } = notify
      io.to(roomId).emit('typing:receive', { senderId, senderName, isTyping })
      if (ack) ack({ success: true, message: 'Typing notification sent successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error handling typing notification:')
    }
  })

  socket.on('message:delete', async (message, ack) => {
    try {
      const { roomId, userId, messageId } = message
      const deletedMessage = await MessageService.deleteMessage(messageId)

      io.to(roomId).emit('message:deleted', deletedMessage)

      const isRecentlyMessage = await MessageService.isRecentlyMessage(roomId, messageId)
      if (isRecentlyMessage) {
        const updatedRoom = await RoomService.updateRoom({
          roomId,
          userId,
          lastMessage: 'Tin nhắn đã bị xoá'
        })

        emitUpdatedRoom(io, updatedRoom)
      }

      if (ack) ack({ success: true, message: 'Message deleted successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error handling message deletion:')
    }
  })
}

module.exports = initializeMessageHandlers
