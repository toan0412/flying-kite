const RoomModel = require("../models/room.model.cjs");
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs');
const UserService = require('./user.service.cjs');
const { getInfoData } = require('../utils/index.cjs');

const RoleRoom = {
    ADMIN: 'admin',
}

class RoomService {

    findByRoom = async (roomName, select = {
        roomName: 1, created_by: 1, status: 1
    }) => {
        return await RoomModel.findOne({ roomName: roomName }).select(select).lean();
    };

    //Tạo phòng
    createRoom = async ({ userId }) => {
        //Check xem người tạo phòng có tồn tại không
        UserService.findByFilter(userId)

        const newRoom = await RoomModel.create({
            created_by: userId,
            members: [{ user_id: userId, role: RoleRoom.ADMIN }]
        });
        return newRoom;
    }

    //Cập nhât phòng
    updateRoom = async ({ roomId, newMembers = [], roomName, status, lastMessage }) => {
        newMembers = ['66bd61871f90807a94916636']
        // Tìm phòng cần cập nhật
        const room = await this.checkExistRoom(roomId)

        if (roomName) { room.roomname = roomName }

        if (status) { room.status = status }

        if (lastMessage) {
            room.last_message = lastMessage
            room.last_message_at = Date.now();
        }

        // Thêm thành viên mới vào phòng (nếu có)
        if (newMembers.length > 0) {
            for (const memberId of newMembers) {
                // Kiểm tra xem thành viên có tồn tại không
                UserService.findByFilter(memberId)
                // Kiểm tra xem thành viên đã có trong phòng chưa, nếu chưa thì thêm vào
                const alreadyMember = room.members.some(member => member.user_id.toString() === memberId)
                if (alreadyMember) throw new BadRequestError('Người dùng đã ở trong phòng')
                else {
                    room.members.push({ user_id: memberId })
                }
            }
        }


        await room.save();
        return room;
    };

    //Lấy danh sách các phòng
    getConversations = async (params) => {
        const userId = params.userId
        const conservations = [];
        // Tìm phòng mà người dùng là thành viên
        const rooms = await RoomModel.find({
            members: { $elemMatch: { user_id: userId } }
        }).lean();

        if (rooms.length === 0) {
            throw new NotFoundError('Chưa có cuộc trò chuyện nào.');
        }

        for (const room of rooms) {
            const baseConversation = {
                id: room._id,
                lastMessage: room.last_message,
                lastMessageAt: room.last_message_at
            };

            if (room.members.length === 2) {
                // Phòng có 2 người, lấy tên của người nhận làm tên phòng
                const receiver = room.members.find(member => member.user_id.toString() !== userId.toString());
                const receiverInfo = await UserService.findByUser(receiver.user_id.toString());
                conservations.push({
                    ...baseConversation,
                    displayName: receiverInfo.fullname,
                    avatarUrl: receiverInfo.avatarUrl,
                });
            }
            else if (room.members.length > 2) {
                // Phòng có trên 2 người, trả về tên phòng
                conservations.push({
                    baseConversation,
                    displayName: room.roomname,
                });
            }
        }

        return conservations;
    };

    //Check exist Room
    checkExistRoom = async (roomId) => {
        const existRoom = await RoomModel.findById(roomId);
        if (!existRoom) {
            throw new NotFoundError('Không tìm thấy phòng với ID')
        }
        return existRoom
    }

}


module.exports = new RoomService()