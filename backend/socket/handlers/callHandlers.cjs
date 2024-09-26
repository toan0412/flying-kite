const { handleSocketError } = require('../utils/socketHelpers.cjs')

function initializeCallHandlers(io, socket) {
  socket.on('call:incoming', async ({ url, userIdsToRing }, ack) => {
    try {
      userIdsToRing.forEach((userId) => io.to(userId).emit('call:receive', url))
      if (ack) ack({ success: true, message: 'Call initiated successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error initiating call:')
    }
  })

  socket.on('call:sendPeerId', async ({ peerId, callerId }, ack) => {
    try {
      io.to(callerId).emit('call:receivePeerId', peerId)
      if (ack) ack({ success: true, message: 'PeerId sent successfully!' })
    } catch (error) {
      handleSocketError(error, ack, 'Error sending PeerId:')
    }
  })
}

module.exports = initializeCallHandlers
