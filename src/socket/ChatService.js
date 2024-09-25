import { io } from 'socket.io-client'

const backendUrl = import.meta.env.VITE_BACKEND_URL
const socket = io(backendUrl)

const ChatService = {
  joinRoom(roomId) {
    socket.emit('joinRoom', roomId)
  },

  leaveRoom(roomId) {
    socket.emit('leaveRoom', roomId)
  },

  sendMessage(message, callback) {
    socket.emit('sendMessage', message, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error sending message:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  onMessageReceived(callback) {
    socket.on('receiveMessage', callback)
  },

  sendNotifyTyping(notify, callback) {
    socket.emit('sendNotifyTyping', notify, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error sending message:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  onNotifyTypingReceived(callback) {
    socket.on('receiveNotifyTyping', callback)
  },

  setLastMessage(message, callback) {
    const { roomId, content } = message
    const lastMessage = content || 'Phương tiện' // Nếu không có content thì là gửi media

    socket.emit('sendLastMessage', { roomId, lastMessage }, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error updating last message:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  deleteMessage(message, callback) {
    socket.emit('deleteMessage', message, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.log('Error delete message', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  onDeletedMessageReceived(callback) {
    socket.on('receiveDeletedMessage', callback)
  },

  updateRoom(roomInfo, callback) {
    socket.emit('updateRoom', roomInfo, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error sending message:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  removeMemberFromRoom(roomInfo, callback) {
    socket.emit('removeMemberFromRoom', roomInfo, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error remove member from room:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  leavePublicRoom(roomInfo, callback) {
    socket.emit('leavePublicRoom', roomInfo, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error sending message:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  inviteCall(data, callback) {
    socket.emit('incomingCall', data, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error ringing phone:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  onIncomingCallReceived(callback) {
    socket.on('receiveIncomingCall', callback)
  },

  sendReceiverPeerId(data, callback) {
    socket.emit('sendReceiverPeerId', data, (ack) => {
      if (ack.success) {
        if (callback) callback(null, ack)
      } else {
        console.error('Error sending PeerId:', ack.message)
        if (callback) callback(new Error(ack.message), null)
      }
    })
  },

  onReceiverPeerIdReceived(callback) {
    socket.on('receiveReceiverPeerId', callback)
  },

  onUpdatedRoomReceived(callback) {
    socket.on('receiveUpdatedRoom', callback)
  },

  onNotificationReceived(callback) {
    socket.on('receiveNotification', callback)
  }
}

export default ChatService
