const socketIO = require('socket.io')
const initializeMessageHandlers = require('./handlers/messageHandlers.cjs')
const initializeRoomHandlers = require('./handlers/roomHandlers.cjs')
const initializeCallHandlers = require('./handlers/callHandlers.cjs')

function initializeSocketServer(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    initializeMessageHandlers(io, socket)
    initializeRoomHandlers(io, socket)
    initializeCallHandlers(io, socket)

    socket.on('disconnect', () => {
      // Handle disconnection if needed
    })
  })

  return io
}

module.exports = initializeSocketServer
