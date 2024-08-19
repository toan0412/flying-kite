const MessageModel = require("../models/message.model.cjs");
const RoomService = require("../services/room.service.cjs");

class MessageService {

    //Tạo tin nhắn
    createMessage = async (req) => {
        const { roomId } = req.params
        const { senderId, content } = req.body
        // Check xem người gửi có trong phòng chat không
        RoomService.checkExistMemberInRoom(roomId, senderId)

        const newMessage = await MessageModel.create({
            roomId: roomId,
            senderId: senderId,
            content: content
        });

        return newMessage;
    }

    //Lấy tin nhắn theo phòng
    getMessageByRoom = async (params) => {
        const { roomId } = params;

        // Check xem phòng có tồn tại không 
        RoomService.checkExistRoomById(roomId)

        const messages = await MessageModel.find({ roomId: roomId })

        return messages;
    }
}


module.exports = new MessageService()