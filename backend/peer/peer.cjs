const { PeerServer } = require('peer')

function setupPeer(server) {
  const peerServer = PeerServer({
    port: 9000,
    path: '/'
  })

  // Liên kết PeerJS server với server HTTP hiện tại
  peerServer.on('connection', (client) => {
    console.log('A peer client connected')
  })

  peerServer.on('disconnect', (client) => {
    console.log('A peer client disconnected')
  })

  return peerServer
}

module.exports = setupPeer
