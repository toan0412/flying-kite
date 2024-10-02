const UserService = require('../services/user.service.cjs')
const { SuccessResponse } = require('../core/success.response.cjs')

class UserController {
  getUser = async (req, res, next) => {
    new SuccessResponse({
      data: await UserService.getUser(req)
    }).send(res)
  }

  getUserById = async (req, res, next) => {
    new SuccessResponse({
      data: await UserService.getUserById(req)
    }).send(res)
  }

  searchUser = async (req, res, next) => {
    new SuccessResponse({
      data: await UserService.findByFilter(req.body)
    }).send(res)
  }

  getAllUsers = async (req, res, next) => {
    new SuccessResponse({
      data: await UserService.getAllUsers(req)
    }).send(res)
  }

  updateUser = async (req, res, next) => {
    new SuccessResponse({
      data: await UserService.updateUser(req)
    }).send(res)
  }

  changeUserPassword = async (req, res, next) => {
    new SuccessResponse({
      data: await UserService.changeUserPassword(req.body)
    }).send(res)
  }
}

module.exports = new UserController()
