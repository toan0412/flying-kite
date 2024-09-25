const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')
const RoomModel = require('../models/room.model.cjs')
const NotificationModel = require('../models/notification.model.cjs')

class NotificationService {
  //Tạo tin nhắn
  createNotification = async (req) => {
    const { senderId, targetId, roomId, content, type } = req
    // Check xem người gửi có trong phòng chat không
    const existRoom = await RoomModel.findById(roomId)

    if (!existRoom) {
      throw new NotFoundError('Phòng không tồn tại')
    }

    const newNotification = await NotificationModel.create({
      senderId: senderId,
      targetId: targetId,
      roomId: roomId,
      content: content,
      type: type
    })

    return newNotification
  }

  //Lấy tin nhắn theo phòng
  getNotificationByRoom = async (req) => {
    const { startDate, endDate } = req.query
    const { roomId } = req.params

    // Check xem phòng có tồn tại không
    const existRoom = await RoomModel.findById(roomId)
    if (!existRoom) throw new NotFoundError('Phòng không tồn tại')

    // Create a filter for date range
    let dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate)
      }
    }

    // Find messages within the date range and sort by createdAt
    const messages = await NotificationModel.find({
      roomId: roomId,
      ...dateFilter
    })
      .sort({ createdAt: -1 })
      .lean()

    return messages
  }
}

module.exports = new NotificationService()
