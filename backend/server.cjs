const app = require('./app.cjs')
const initializeSocketServer = require('./socket/index.cjs')
const setupPeer = require('./peer/peer.cjs')
require('dotenv').config()

const server = app.listen(process.env.PORT || 3030, () => {
  console.log('Server started on port: ' + (process.env.PORT || 3030))
})

const io = initializeSocketServer(server)
const peerServer = setupPeer(server)

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed')
    peerServer.close(() => console.log('PeerJS server closed'))
  })
})
