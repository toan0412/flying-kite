const RoomModel = require('../models/room.model.cjs')
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')
const { ObjectId } = require('mongodb')
const { default: userModel } = require('../models/user.model.cjs')

const RoleRoom = {
  ADMIN: 'admin',
  MEMBER: 'member'
}

class RoomService {
  //Hàm tìm phòng
  findByRoom = async (
    roomName,
    select = {
      roomName: 1,
      createdBy: 1,
      status: 1
    }
  ) => {
    return await RoomModel.findOne({ roomName: roomName }).select(select).lean()
  }

  //Tạo phòng
  createRoom = async (req) => {
    const { members = [], roomName, type, avatarUrl } = req.body
    const userId = req.headers['x-client-id']

    // Tạo danh sách thành viên với người tạo phòng là chủ phòng
    const membersRoom = [{ userId: userId, role: RoleRoom.ADMIN }]

    // Kiểm tra số lượng thành viên
    if (members.length < 1) {
      throw new BadRequestError('Create room with at least 2 members')
    }

    // Thêm các thành viên vào danh sách thành viên của phòng
    for (const memberId of members) {
      const member = await userModel.findById(memberId)
      if (!member) {
        throw new BadRequestError(`Member not found`)
      }
      membersRoom.push({ userId: memberId, role: RoleRoom.MEMBER })
    }

    // Xác định loại phòng
    const roomType = type || (membersRoom.length > 2 ? 'public' : 'private')

    // Tạo phòng mới
    const newRoom = await RoomModel.create({
      createdBy: userId,
      members: membersRoom,
      roomName: roomName || '',
      type: roomType,
      avatarUrl: avatarUrl || ''
    })

    return newRoom
  }

  //Cập nhât phòng
  updateRoom = async ({ roomId, newMembers = [], roomName, avatarUrl, lastMessage }) => {
    // Tìm phòng cần cập nhật
    const room = await this.checkExistRoomById(roomId)

    if (roomName) {
      room.roomName = roomName
    }

    if (lastMessage) {
      room.lastMessage = lastMessage
      room.lastMessageAt = Date.now()
    }

    if (avatarUrl) {
      room.avatarUrl = avatarUrl
    }

    // Thêm thành viên mới vào phòng (nếu có)
    if (newMembers.length > 0) {
      for (const memberId of newMembers) {
        // Kiểm tra xem thành viên có tồn tại không
        const existUser = userModel.findById(memberId)
        if (!existUser) {
          throw new BadRequestError('Người dùng không tồn tại')
        }
        // Kiểm tra xem thành viên đã có trong phòng chưa, nếu chưa thì thêm vào
        const alreadyMember = room.members.some((member) => member.userId.toString() === memberId)
        if (alreadyMember) throw new BadRequestError('Người dùng đã ở trong phòng')
        else {
          room.members.push({ userId: memberId })
        }
      }
    }

    if (room.members.length == 2) {
      room.type = 'private'
    } else {
      room.type = 'public'
    }

    await room.save()
    return room
  }

  //Xóa thành viên khỏi phòng với quyền admin
  async removeMemberFromRoom({ roomId, userId, memberId }) {
    try {
      const room = await this.checkExistRoomById(roomId)

      // Kiểm tra xem người xóa có phải chủ phòng không
      const adminRole = await RoomModel.findOne({
        _id: roomId,
        createdBy: userId
      })

      if (!adminRole) throw new BadRequestError('Người dùng không phải chủ phòng')

      // Chuyển memberId thành ObjectId để so sánh chính xác
      const memberIdObject = ObjectId.createFromHexString(memberId)
      console.log('memberIdObject', memberIdObject)

      // Lọc danh sách thành viên để loại bỏ thành viên có memberId cần xóa
      room.members = room.members.filter((m) => !m.userId.equals(memberIdObject))

      // Lưu lại phòng đã được cập nhật
      await room.save()

      return room
    } catch (error) {
      throw new BadRequestError('Xảy ra lỗi khi xóa thành viên khỏi phòng')
    }
  }

  //Rời phòng
  async leaveRoom({ roomId, userId }) {
    try {
      const room = await this.checkExistRoomById(roomId)

      // Chuyển memberId thành ObjectId để so sánh chính xác
      const memberIdObject = ObjectId.createFromHexString(userId)

      // Lọc danh sách thành viên để loại bỏ thành viên có memberId cần xóa
      room.members = room.members.filter((m) => !m.userId.equals(memberIdObject))

      //Nếu phòng ko còn ai => xóa phòng
      if (room.members.length === 0) {
        await RoomModel.deleteOne({ _id: roomId })
        return { message: 'Phòng đã được xóa' }
      }

      // Lưu lại phòng đã được cập nhật
      await room.save()

      return room
    } catch (error) {
      throw new BadRequestError('Xảy ra lỗi khi rời khỏi phòng')
    }
  }

  //Lấy danh sách các phòng
  getConversations = async (params) => {
    const userId = params.userId
    // Tìm phòng mà người dùng là thành viên và có tin nhắn
    const rooms = await RoomModel.find({
      members: { $elemMatch: { userId: userId } },
      lastMessageAt: { $ne: '' }
    })
      .sort({ updatedAt: -1 })
      .lean()

    if (rooms.length === 0) {
      return []
    }

    return rooms
  }

  //Check exist Room
  checkExistRoomById = async (roomId) => {
    const existRoom = await RoomModel.findById(roomId)
    if (!existRoom) {
      throw new NotFoundError('Không tìm thấy phòng với ID')
    }
    return existRoom
  }

  //Check exist member in room
  checkExistMemberInRoom = async (roomId, userId) => {
    const room = await this.checkExistRoomById(roomId)
    const existMember = room.members.some(
      (member) => member.userId.toString() === userId.toString()
    )
    if (!existMember) {
      throw new NotFoundError('Người dùng không tồn tại trong phòng')
    }
    return
  }
}

module.exports = new RoomService()
