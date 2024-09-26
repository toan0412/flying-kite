const RoomService = require('../../services/room.service.cjs')
const { emitUpdatedRoom, handleSocketError } = require('../utils/socketHelpers.cjs')

function initializeRoomHandlers(io, socket) {
  socket.on('room:join', (roomId) => {
    socket.join(roomId)
  })

  socket.on('room:leave', (roomId) => {
    socket.leave(roomId)
  })

  socket.on('room:update', async (roomInfo, ack) => {
    try {
      const updatedRoom = await RoomService.updateRoom(roomInfo)
      emitUpdatedRoom(io, updatedRoom)
      if (ack) ack({ success: true, message: 'Room updated successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error updating room:')
    }
  })

  socket.on('room:removeMember', async (roomInfo, ack) => {
    try {
      const updatedRoom = await RoomService.removeMemberFromRoom(roomInfo)
      emitUpdatedRoom(io, updatedRoom)
      if (ack) ack({ success: true, message: 'Member removed successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error removing member:')
    }
  })

  socket.on('room:leavePublic', async (roomInfo, ack) => {
    try {
      const { userId } = roomInfo
      const updatedRoom = await RoomService.leaveRoom(roomInfo)
      emitUpdatedRoom(io, updatedRoom)
      io.to(userId).emit('room:updated', updatedRoom)
      if (ack) ack({ success: true, message: 'Left room successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error leaving room:')
    }
  })
}

module.exports = initializeRoomHandlers
