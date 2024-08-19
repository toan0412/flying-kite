const RoomModel = require("../models/room.model.cjs");
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs');
const UserService = require('./user.service.cjs');

const RoleRoom = {
  ADMIN: 'admin',
  MEMBER: 'member'
}

class RoomService {
  findByRoom = async (
    roomName,
    select = {
      roomName: 1,
      created_by: 1,
      status: 1
    }
  ) => {
    return await RoomModel.findOne({ roomName: roomName }).select(select).lean()
  }

  findByRoom = async (roomName, select = {
    roomName: 1, createdBy: 1, status: 1
  }) => {
    return await RoomModel.findOne({ roomName: roomName }).select(select).lean();
  };

  //Tạo phòng mới nếu chưa có (Lấy phòng nếu đã có)
  getOrCreateRoom = async (req) => {
    const { members = [], roomName = '' } = req.body;

    const userId = req.headers['x-client-id'];
    const membersRoom = [{ userId: userId, role: RoleRoom.ADMIN }];

    // Check xem member trong phòng có tồn tại không
    await UserService.findByFilter(userId)

    // Thêm từng thành viên vào danh sách membersRoom
    for (const memberId of members) {
      membersRoom.push({ userId: memberId, role: RoleRoom.MEMBER });
    }

    // Xác định loại phòng
    const type = (members.length > 2) ? "public" : "private"

    //Nếu phòng là private thì check xem phòng đã tồn tại chưa
    if (type == 'private') {
      const existPrivateRoom = await RoomModel.findOne({
        type: 'private',
        members: { $all: [{ $elemMatch: { userId: userId } }, { $elemMatch: { userId: members[0] } }] }
      }).lean();
      if (existPrivateRoom) {
        return existPrivateRoom
      }
    }

    // Tạo phòng mới
    const newRoom = await RoomModel.create({
      createdBy: userId,
      members: membersRoom,
      roomname: roomName,
      type: type
    });

    return newRoom;
  };


  //Cập nhât phòng
  updateRoom = async ({ roomId, newMembers = [], roomName, lastMessage }) => {
    // Tìm phòng cần cập nhật
    const room = await this.checkExistRoomById(roomId)

    if (roomName) { room.roomName = roomName }

    if (lastMessage) {
      room.lastMessage = lastMessage
      room.lastMessageAt = Date.now();
    }

    // Thêm thành viên mới vào phòng (nếu có)
    if (newMembers.length > 0) {
      for (const memberId of newMembers) {
        // Kiểm tra xem thành viên có tồn tại không
        UserService.findByFilter(memberId)
        // Kiểm tra xem thành viên đã có trong phòng chưa, nếu chưa thì thêm vào
        const alreadyMember = room.members.some(member => member.userId.toString() === memberId)
        if (alreadyMember) throw new BadRequestError('Người dùng đã ở trong phòng')
        else {
          room.members.push({ userId: memberId })
        }
      }
    }

    if (room.members.length == 2) {
      room.type = 'private'
    }
    else {
      room.type = 'public'
    }


    await room.save();
    return room;
  };

  //Lấy danh sách các phòng
  getConversations = async (params) => {
    const userId = params.userId
    // Tìm phòng mà người dùng là thành viên và có tin nhắn 
    const rooms = await RoomModel.find({
      members: { $elemMatch: { userId: userId } },
      lastMessageAt: { $ne: '' }
    })
    .sort({ updatedAt: -1 }) 
    .lean();

    if (rooms.length === 0) {
      return []
    }

    return rooms;
  };

  //Check exist Room
  checkExistRoomById = async (roomId) => {
    const existRoom = await RoomModel.findById(roomId);
    if (!existRoom) {
      throw new NotFoundError('Không tìm thấy phòng với ID')
    }
    return existRoom
  }

  //Check exist member in room
  checkExistMemberInRoom = async (roomId, userId) => {
    const room = await this.checkExistRoomById(roomId)
    const existMember = room.members.some(member => member.userId.toString() === userId.toString())
    if (!existMember) {
      throw new NotFoundError('Người dùng không tồn tại trong phòng')
    }
    return
  }

}

module.exports = new RoomService()
