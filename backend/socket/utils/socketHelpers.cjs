function emitUpdatedRoom(io, updatedRoom) {
  updatedRoom.members.forEach((member) => {
    if (member.role !== 'left') {
      io.to(member.userId.toString()).emit('room:updated', updatedRoom)
    }
  })
}

function handleSocketError(error, ack, errorMessage) {
  console.error(errorMessage, error)
  if (ack) ack({ success: false, message: error.message })
}

module.exports = {
  emitUpdatedRoom,
  handleSocketError
}
