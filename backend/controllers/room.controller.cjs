const RoomService = require("../services/room.service.cjs");
const { SuccessResponse, CREATED } = require('../core/success.response.cjs')

class RoomController {
  getOrCreateRoom = async (req, res, next) => {
    new SuccessResponse({
      message: 'Tạo(lấy) phòng thành công',
      data: await RoomService.getOrCreateRoom(req)
    }).send(res);
  }

  updateRoom = async (req, res, next) => {
    new SuccessResponse({
      message: 'Cập nhật phòng thành công',
      data: await RoomService.updateRoom(req.body)
    }).send(res)
  }

  getConversations = async (req, res, next) => {
    new SuccessResponse({
      message: 'Lấy thông tin các cuộc trò chuyện thành công',
      data: await RoomService.getConversations(req.params)
    }).send(res)
  }
}

module.exports = new RoomController();