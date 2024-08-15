const MessageModel = require("../models/message.model.cjs");
const RoomService = require("../services/room.service.cjs");
const UserService = require("../services/user.service.cjs");

class MessageService {

    //Tạo tin nhắn
    createMessage = async ({ roomId, senderId, content }) => {
        // Check xem người gửi có tồn tại không
        UserService.findByFilter(senderId)

        // Check xem phòng có tồn tại không 
        RoomService.checkExistRoom(roomId)

        const newMessage = await MessageModel.create({
            room_id: roomId,
            sender_id: senderId,
            content: content
        });

        return newMessage;
    }

    //Lấy tin nhắn theo phòng
    getMessageByRoom = async (params) => {
        const { roomId } = params;
        // Check xem người gửi có tồn tại không
        // UserService.findByFilter(userId)

        // Check xem phòng có tồn tại không 
        RoomService.checkExistRoom(roomId)

        const messages = await MessageModel.find({ room_id: roomId })

        return messages;
    }
}


module.exports = new MessageService()