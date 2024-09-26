import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL
const socket = io(backendUrl)

class ChatService {
  // Room-related methods
  static joinRoom(roomId) {
    socket.emit('room:join', roomId)
  }

  static leaveRoom(roomId) {
    socket.emit('room:leave', roomId)
  }

  static updateRoom(roomInfo) {
    return this.emitWithAck('room:update', roomInfo)
  }

  static removeMemberFromRoom(roomInfo) {
    return this.emitWithAck('room:removeMember', roomInfo)
  }

  static leavePublicRoom(roomInfo) {
    return this.emitWithAck('room:leavePublic', roomInfo)
  }

  // Message-related methods
  static sendMessage(message) {
    return this.emitWithAck('message:send', message)
  }

  static deleteMessage(message) {
    return this.emitWithAck('message:delete', message)
  }

  static sendTypingNotification(notify) {
    return this.emitWithAck('typing:notify', notify)
  }

  static setLastMessage(message) {
    const { roomId, content } = message
    const lastMessage = content || 'Phương tiện'
    return this.emitWithAck('message:setLast', { roomId, lastMessage })
  }

  // Call-related methods
  static initiateCall(data) {
    return this.emitWithAck('call:incoming', data)
  }

  static sendReceiverPeerId(data) {
    return this.emitWithAck('call:sendPeerId', data)
  }

  // Event listeners
  static onMessageReceived(callback) {
    socket.on('message:receive', callback)
  }

  static onTypingNotificationReceived(callback) {
    socket.on('typing:receive', callback)
  }

  static onDeletedMessageReceived(callback) {
    socket.on('message:deleted', callback)
  }

  static onRoomUpdated(callback) {
    socket.on('room:updated', callback)
  }

  static onIncomingCallReceived(callback) {
    socket.on('call:receive', callback)
  }

  static onReceiverPeerIdReceived(callback) {
    socket.on('call:receivePeerId', callback)
  }

  static onNotificationReceived(callback) {
    socket.on('notification:receive', callback)
  }

  // Helper method for emitting events with acknowledgment
  static emitWithAck(event, data) {
    return new Promise((resolve, reject) => {
      socket.emit(event, data, (ack) => {
        if (ack.success) {
          resolve(ack)
        } else {
          console.error(`Error in ${event}:`, ack.message)
          reject(new Error(ack.message))
        }
      })
    })
  }
}

export default ChatService
