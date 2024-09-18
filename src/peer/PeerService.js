import Peer from 'peerjs'

class PeerService {
  constructor() {
    this.peer = null
  }

  // Hàm tạo Peer hoặc trả về Peer hiện tại nếu đã tồn tại
  createPeer(userId) {
    if (this.peer) {
      console.log('Peer already exists, returning existing peer:', this.peer.id)
      return this.peer
    }

    // Khởi tạo Peer mới nếu chưa tồn tại
    this.peer = new Peer(userId, {
      host: 'justtona.id.vn',
      port: 9000,
      secure: false
    })

    this.peer.on('open', (id) => {
      console.log(`PeerJS connected with ID: ${id}`)
    })

    this.peer.on('error', (err) => {
      console.error('PeerJS error:', err)
    })

    return this.peer
  }

  // Hàm connectToPeer để kết nối đến Peer khác
  connectToPeer(peerId) {
    if (!this.peer) {
      console.error('Peer instance has not been created yet!')
      return
    }

    const conn = this.peer.connect(peerId)

    conn.on('open', () => {
      console.log(`Connected to peer: ${peerId}`)
      conn.send('Hello, peer!')
    })

    conn.on('data', (data) => {
      console.log(`Received data from peer ${peerId}:`, data)
    })

    conn.on('error', (err) => {
      console.error('Connection error:', err)
    })

    conn.on('close', () => {
      console.log(`Connection with peer ${peerId} closed.`)
    })
  }
}

export default new PeerService()
