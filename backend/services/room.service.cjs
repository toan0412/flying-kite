const RoomModel = require("../models/room.model.cjs");
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs');
const { findByUser } = require('./user.service.cjs');
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
        const userCreatedRoom = await findByUser(userId)
        if (!userCreatedRoom) {
            throw new NotFoundError('Người tạo phòng không tồn tại')
        }

        const newRoom = await RoomModel.create({
            created_by: userCreatedRoom._id,
            members: [{ user_id: userCreatedRoom._id, role: RoleRoom.ADMIN }]
        });
        return newRoom;
    }

    //Cập nhât phòng
    updateRoom = async ({ roomId, newMembers = [], roomName, status, lastMessage }) => {
        console.log(roomId, newMembers)
        // Tìm phòng cần cập nhật
        const room = await RoomModel.findById(roomId)
        if (!room) {
            throw new NotFoundError('Phòng không tồn tại')
        }

        // Thêm thành viên mới vào phòng (nếu có)
        if (newMembers.length > 0) {
            for (const memberId of newMembers) {
                // Kiểm tra xem thành viên có tồn tại không
                const user = await findByUser(memberId)
                if (!user) {
                    throw new NotFoundError(`Người dùng với ID ${memberId} không tồn tại`)
                }
                // Kiểm tra xem thành viên đã có trong phòng chưa, nếu chưa thì thêm vào
                const alreadyMember = room.members.some(member => member.user_id.toString() === memberId)
                if (alreadyMember) throw new BadRequestError('Người dùng đã ở trong phòng')
                else {
                    room.members.push({ user_id: memberId })
                }
            }
        }
        if (roomName) { room.roomname = roomName }

        if (status) { room.status = status }

        if (lastMessage) {
            room.last_message = lastMessage
            room.last_message_at = Date.now();
        }

        // Lưu thay đổi vào cơ sở dữ liệu
        await room.save();

        return room;
    };

    //Lấy danh sách các phòng
    getConversations = async ({ userId }) => {
        const conservations = [];
        // Tìm phòng mà người dùng là thành viên
        const rooms = await RoomModel.find({
            members: { $elemMatch: { user_id: userId } }
        }).lean();

        if (rooms.length === 0) {
            throw new NotFoundError('Chưa có cuộc trò chuyện nào.');
        }

        for (const room of rooms) {
            if (room.members.length === 2) {
                // Phòng có 2 người, lấy id của người nhận
                const receiver = room.members.find(member => member.user_id.toString() !== userId.toString());
                // Lấy thông tin người nhận
                const receiverInfo = await findByUser(receiver.user_id.toString());
                conservations.push({
                    displayName: receiverInfo.fullname,
                    last_message: room.last_message,
                    last_message_at: room.last_message_at
                });
            } else if (room.members.length > 2) {
                // Phòng có trên 2 người, trả về tên phòng
                conservations.push({
                    displayName: room.roomname,
                    last_message: room.last_message,
                    last_message_at: room.last_message_at
                });
            }
        }

        return conservations;
    };

}


module.exports = new RoomService()