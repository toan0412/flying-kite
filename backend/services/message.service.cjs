const MessageModel = require('../models/message.model.cjs')
const RoomService = require('../services/room.service.cjs')
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')

class MessageService {
  //Tạo tin nhắn
  createMessage = async (req) => {
    const { roomId } = req.params
    const { senderId, content, media } = req.body
    // Check xem người gửi có trong phòng chat không
    RoomService.checkExistMemberInRoom(roomId, senderId)

    const newMessage = await MessageModel.create({
      roomId: roomId,
      senderId: senderId,
      content: content,
      media: media
    })

    return newMessage
  }

  deleteMessage = async (messageId) => {
    //Check xem tin nhắn có tồn tại không
    const existMessage = await MessageModel.findById(messageId)

    if (!existMessage) throw new NotFoundError('Không tìm thấy tin nhắn')

    existMessage.media = []
    existMessage.content = ''
    existMessage.isDelete = true

    existMessage.save()
    return existMessage
  }

  //Lấy tin nhắn theo phòng
  getMessageByRoom = async (req) => {
    const { limit, offset } = req.query
    const { roomId } = req.params

    // Check xem phòng có tồn tại không
    await RoomService.checkExistRoomById(roomId)

    const messages = await MessageModel.find({ roomId: roomId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()

    return messages
  }

  // Tìm kiếm tin nhắn theo phòng
  searchMessagesByRoom = async (req) => {
    const { roomId, searchString } = req.query
    console.log(roomId, searchString)
    // 0. Kiểm tra phòng có tồn tại không
    await RoomService.checkExistRoomById(roomId)

    // 1. Tìm các tin nhắn khớp với từ khóa
    const matchedMessages = await MessageModel.find({
      roomId: roomId,
      content: { $regex: searchString || '', $options: 'i' }
    }).sort({ createdAt: -1 })

    if (!matchedMessages.length) {
      return []
    }

    return matchedMessages
  }

  // Kiểm tra xem có phải tin nhắn cuối cùng không
  isRecentlyMessage = async (roomId, messageId) => {
    const room = await RoomService.checkExistRoomById(roomId)
    const lastMessage = room.lastMessageAt
    const message = await MessageModel.findById(messageId)

    if (!lastMessage || !message) {
      return false
    }

    return lastMessage.toString() === message.createdAt.toString()
  }
}

module.exports = new MessageService()
