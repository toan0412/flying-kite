const RoomModel = require('../models/room.model.cjs')
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')
const UserModel = require('../models/user.model.cjs')
const mongoose = require('mongoose')
const MessageService = require('../services/message.service.cjs')

const RoleRoom = {
  ADMIN: 'admin',
  MEMBER: 'member',
  LEFT: 'left'
}

class RoomService {
  async createRoom(req) {
    /**
     * Tạo phòng mới
     *
     * Các bước thực hiện:
     * 1. Kiểm tra số lượng thành viên
     * 2. Tạo danh sách thành viên, với userId là admin
     * 3. Tạo phòng mới
     * 4. Lấy thông tin thành viên
     * 5. Xử lý trường hợp phòng private
     */
    try {
      const userId = req.headers['x-client-id']
      const { members = [], roomName, type, avatarUrl } = req.body

      if (members.length < 1) {
        throw new BadRequestError('Phòng phải gồm ít nhất 2 người')
      }

      const membersRoom = [{ userId, role: RoleRoom.ADMIN }]
      const validMembers = await UserModel.find({ _id: { $in: members } }).lean()
      membersRoom.push(
        ...validMembers.map((member) => ({ userId: member._id, role: RoleRoom.MEMBER }))
      )

      const newRoom = await RoomModel.create({
        createdBy: userId,
        members: membersRoom,
        roomName: roomName || '',
        type,
        avatarUrl: avatarUrl || ''
      })

      const userIds = membersRoom.map((member) => member.userId)
      const users = await UserModel.find({ _id: { $in: userIds } }).lean()

      const membersInfo = users.map((user) => ({
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl
      }))

      let receiverId = null
      if (type === 'private') {
        const receiver = users.find((user) => user._id.toString() !== userId)
        if (receiver) {
          newRoom.roomName = receiver.fullName
          newRoom.avatarUrl = receiver.avatarUrl
          receiverId = receiver._id
        }
      }

      if (type === 'public') {
        const createSystemMessage = async (content) => {
          await MessageService.createMessage({
            params: { roomId: newRoom._id },
            body: { senderId: userId, content, isSystemMessage: true }
          })
        }
        await createSystemMessage('đã tạo phòng')
        await createSystemMessage(`đã đặt tên phòng là "${roomName}"`)
        for (const member of validMembers) {
          await createSystemMessage(`đã thêm ${member.fullName} vào phòng`)
        }
      }

      return { ...newRoom.toObject(), members: membersInfo, receiverId }
    } catch (error) {
      throw new BadRequestError(`Lỗi khi tạo phòng: ${error.message}`)
    }
  }

  async updateRoom(req) {
    /**
     * Cập nhật thông tin phòng
     *
     * Các bước thực hiện:
     * 1. Lấy ra thông tin phòng từ DB
     * 2. Kiểm tra và thêm thông tin mới vào phòng nếu có
     * 3. Cập nhật thành viên mới (nếu có)
     * 4. Lấy thông tin chi tiết của tất cả thành viên
     * 5. Xử lý trường hợp phòng private
     */
    try {
      const { roomId, userId, newMembers = [], roomName, avatarUrl, lastMessage } = req

      const room = await RoomModel.findById(roomId)

      if (!room) {
        throw new NotFoundError('Không tìm thấy phòng')
      }

      if (lastMessage) {
        room.lastMessage = lastMessage
        room.lastMessageAt = Date.now()
      }

      if (roomName) {
        room.roomName = roomName
      }

      if (avatarUrl) {
        room.avatarUrl = avatarUrl
      }

      if (newMembers.length > 0) {
        const newMembersInfo = await UserModel.find({ _id: { $in: newMembers } })
          .select('_id fullName username avatarUrl')
          .lean()

        const existingMembersMap = new Map(room.members.map((m) => [m.userId.toString(), m]))

        for (const newMember of newMembersInfo) {
          const existingMember = existingMembersMap.get(newMember._id.toString())
          if (!existingMember) {
            room.members.push({ userId: newMember._id, role: RoleRoom.MEMBER })
          } else if (existingMember.role === RoleRoom.LEFT) {
            existingMember.role = RoleRoom.MEMBER
          }
        }
      }

      await room.save()

      const members = await this.getMembersInfo(room)

      let receiverId = null

      if (room.type === 'private') {
        const receiverInfo = members.find((member) => member.userId.toString() !== userId)
        if (receiverInfo) {
          room.roomName = room.roomName || receiverInfo.fullName
          room.avatarUrl = room.avatarUrl || receiverInfo.avatarUrl
          receiverId = receiverInfo._id
        }
      }

      return { ...room.toObject(), members, receiverId }
    } catch (error) {
      throw new BadRequestError(`Lỗi khi cập nhật phòng: ${error.message}`)
    }
  }

  async removeMemberFromRoom(req) {
    try {
      const { roomId, userId, memberId } = req
      const room = await RoomModel.findById(roomId)

      if (!room) {
        throw new NotFoundError('Không tìm thấy phòng')
      }

      if (!room.createdBy.equals(userId)) {
        throw new BadRequestError('Người dùng không có quyền admin')
      }

      const memberToRemove = room.members.find((m) => m.userId.equals(memberId))
      if (!memberToRemove) {
        throw new BadRequestError('Không tìm thấy thành viên cần xóa')
      }

      memberToRemove.role = RoleRoom.LEFT

      await room.save()

      const members = await this.getMembersInfo(room)
      return { ...room.toObject(), members }
    } catch (error) {
      throw new BadRequestError(`Lỗi khi xóa thành viên: ${error.message}`)
    }
  }

  async leaveRoom(req) {
    /**
     * Rời khỏi phòng
     *
     * Các bước thực hiện:
     * 1. Lấy thông tin phòng từ DB
     * 2. Kiểm tra xem người dùng có trong phòng không
     * 3. Cập nhật trạng thái thành viên thành 'left'
     * 4. Nếu người rời phòng là admin, chọn admin mới
     * 5. Lưu thông tin phòng đã cập nhật
     * 6. Lấy thông tin chi tiết của tất cả thành viên
     */
    try {
      const { roomId, userId } = req
      const room = await RoomModel.findById(roomId)

      if (!room) {
        throw new NotFoundError('Không tìm thấy phòng')
      }

      const memberIndex = room.members.findIndex((m) => m.userId.toString() === userId)
      if (memberIndex === -1) {
        throw new BadRequestError('Người dùng không tồn tại trong phòng')
      }

      const leavingUser = await UserModel.findById(userId).select('fullName').lean()
      if (!leavingUser) {
        throw new BadRequestError('Không tìm thấy thông tin người dùng')
      }

      const createSystemMessage = async (content) => {
        await MessageService.createMessage({
          params: { roomId },
          body: { senderId: userId, content, isSystemMessage: true }
        })
      }

      room.members[memberIndex].role = RoleRoom.LEFT
      await createSystemMessage(`đã rời khỏi phòng`)

      if (room.createdBy.toString() === userId) {
        const newAdmin = room.members.find(
          (m) => m.userId.toString() !== userId && m.role !== RoleRoom.LEFT
        )
        if (newAdmin) {
          newAdmin.role = RoleRoom.ADMIN
        } else {
          await createSystemMessage('Phòng không còn quản trị viên')
        }
      }

      await room.save()

      const members = await this.getMembersInfo(room)
      return { ...room.toObject(), members }
    } catch (error) {
      throw new BadRequestError(`Lỗi khi rời phòng: ${error.message}`)
    }
  }

  async getConversations(req) {
    //B1: Lọc ra các phòng có người dùng là thành viên theo thời gian update
    //B2: Thêm thông tin người dùng khác vào mỗi phòng
    //B3: Nếu phòng là private thì đổi thông tin phòng theo tên người không phải là người dùng
    //B4: Mapping thông tin người dùng vào trường members của phòng
    //B5: Trả về thông tin cần thiết

    const userId = req.headers['x-client-id']
    const objectId = new mongoose.Types.ObjectId(userId)

    const rooms = await RoomModel.aggregate([
      {
        $match: {
          members: {
            $elemMatch: { userId: objectId, role: { $ne: 'left' }, type: { $ne: 'inactive' } }
          }
        }
      },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: 'Users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'membersInfo'
        }
      },
      {
        $addFields: {
          otherMember: {
            $filter: {
              input: '$membersInfo',
              as: 'member',
              cond: { $ne: ['$$member._id', objectId] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          roomName: {
            $cond: [
              { $eq: ['$type', 'private'] },
              { $arrayElemAt: ['$otherMember.fullName', 0] },
              '$roomName'
            ]
          },
          avatarUrl: {
            $cond: [
              { $eq: ['$type', 'private'] },
              { $arrayElemAt: ['$otherMember.avatarUrl', 0] },
              '$avatarUrl'
            ]
          },
          receiverId: {
            $cond: [{ $eq: ['$type', 'private'] }, { $arrayElemAt: ['$otherMember._id', 0] }, null]
          },
          lastMessage: 1,
          lastMessageAt: 1,
          updatedAt: 1,
          type: 1
        }
      }
    ])

    return rooms
  }

  async getRoomById(req) {
    //B1: Lọc phòng theo ID
    //B2: Thêm thông tin người dùng khác vào mỗi phòng
    //B3: Nếu phòng là private thì đổi thông tin phòng theo tên người không phải là người dùng
    //B4: Mapping thông tin người dùng vào trường members của phòng
    const { roomId } = req.params
    const userId = req.headers['x-client-id']

    const roomObjectId = new mongoose.Types.ObjectId(roomId)
    const userObjectId = new mongoose.Types.ObjectId(userId)

    const room = await RoomModel.aggregate([
      {
        $match: {
          _id: roomObjectId
        }
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'members.userId',
          foreignField: '_id',
          as: 'membersInfo'
        }
      },
      {
        $addFields: {
          otherMember: {
            $filter: {
              input: '$membersInfo',
              as: 'member',
              cond: { $ne: ['$$member._id', userObjectId] }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          roomName: {
            $cond: [
              { $eq: ['$type', 'private'] },
              { $arrayElemAt: ['$otherMember.fullName', 0] },
              '$roomName'
            ]
          },
          avatarUrl: {
            $cond: [
              { $eq: ['$type', 'private'] },
              { $arrayElemAt: ['$otherMember.avatarUrl', 0] },
              '$avatarUrl'
            ]
          },
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                $mergeObjects: [
                  '$$member',
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$membersInfo',
                          cond: { $eq: ['$$this._id', '$$member.userId'] }
                        }
                      },
                      0
                    ]
                  }
                ]
              }
            }
          },
          lastMessage: 1,
          lastMessageAt: 1,
          updatedAt: 1,
          createdBy: 1,
          type: 1,
          createdAt: 1
        }
      },
      {
        $project: {
          'members._id': 0,
          'members.email': 0,
          'members.password': 0,
          'members.roles': 0,
          'members.status': 0,
          'members.blocks': 0,
          'members.friends': 0,
          'members.createdAt': 0,
          'members.updatedAt': 0,
          'members.__v': 0
        }
      }
    ])

    return room[0]
  }

  async getMembersInfo(room) {
    const allMembersInfo = await UserModel.find({
      _id: { $in: room.members.map((m) => m.userId) }
    })
      .select('_id fullName username avatarUrl')
      .lean()

    return room.members.map((member) => {
      const userInfo = allMembersInfo.find((user) => user._id.equals(member.userId))
      return {
        userId: member.userId,
        role: member.role,
        username: userInfo?.username,
        fullName: userInfo?.fullName,
        avatarUrl: userInfo?.avatarUrl
      }
    })
  }
}
module.exports = new RoomService()
