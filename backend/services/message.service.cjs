const MessageModel = require('../models/message.model.cjs')
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')
const RoomModel = require('../models/room.model.cjs')

class MessageService {
  //Tạo tin nhắn
  createMessage = async (req) => {
    const { roomId, senderId, content, media, replyTo, isSystemMessage } = req

    const newMessage = await MessageModel.create({
      roomId: roomId,
      senderId: senderId,
      content: content,
      media: media,
      replyTo: replyTo,
      isSystemMessage: isSystemMessage
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
    const existRoom = await RoomModel.findById(roomId)

    if (!existRoom) throw new NotFoundError('Phòng không tồn tại')

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
    // 0. Kiểm tra phòng có tồn tại không
    const existRoom = await RoomModel.findById(roomId)

    if (!existRoom) throw new NotFoundError('Phòng không tồn tại')

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
    const room = await RoomModel.findById(roomId)
    const lastMessage = room.lastMessageAt
    const message = await MessageModel.findById(messageId)

    if (!lastMessage || !message) {
      return false
    }

    return lastMessage.toString() === message.createdAt.toString()
  }

  getMessagesCountByRoom = async (req) => {
    try {
      const result = await MessageModel.aggregate([
        {
          $group: {
            _id: "$roomId", // Group by roomId
            messageCount: { $sum: 1 }, // Count messages
          },
        },
        {
          $project: {
            _id: 0, // Exclude MongoDB's default `_id` field
            roomId: "$_id", // Rename `_id` to `roomId`
            messageCount: 1, // Keep `messageCount` field
          },
        },
        { $sort: { messageCount: -1 } }, // Sort by message count
      ]);

      return result;
    } catch (error) {
      console.error("Error fetching message statistics:", error);
      throw error;
    }
  };

}

module.exports = new MessageService()
