const MessageService = require("../services/message.service.cjs");
const { SuccessResponse, CREATED } = require('../core/success.response.cjs')

class MessageController {
  createMessage = async (req, res, next) => {
    new CREATED({
      message: 'Tạo tin nhắn mới thành công',
      data: await MessageService.createMessage(req)
    }).send(res)
  }

  getMessageByRoom = async (req, res, next) => {
    new SuccessResponse({
      message: 'Lấy cuộc hội thoại thành công',
      data: await MessageService.getMessageByRoom(req.params)
    }).send(res)
  }

}

module.exports = new MessageController();