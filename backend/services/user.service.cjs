const mongoose = require('mongoose')
const userModel = require('../models/user.model.cjs')
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')
const { getInfoData } = require('../utils/index.cjs')

class UserService {
  // Tìm người dùng bằng ObjectId hoặc username
  getUserById = async (req) => {
    const { id } = req.params
    const existUser = await userModel.findById(id).lean()

    if (!existUser) {
      throw new NotFoundError('Người dùng không tồn tại')
    }

    return getInfoData({
      field: ['_id', 'username', 'fullname', 'email', 'avatarUrl'],
      object: existUser
    })
  }

  // Lấy thông tin người dùng theo ID từ header
  getUser = async (req) => {
    const userId = req.headers['x-client-id']
    const user = await userModel.findById(userId).lean()
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại')
    }
    return getInfoData({
      field: ['_id', 'username', 'fullname', 'email', 'avatarUrl'],
      object: user
    })
  }

  //Cập nhật thông tin người dùng
  updateUser = async (req) => {
    const userId = req.headers['x-client-id']

    // Chuyển đổi userId thành ObjectId (Mongoose sẽ tự động chuyển đổi nếu nó là chuỗi hợp lệ)
    const existUser = await userModel.findById(userId)

    if (!existUser) {
      throw new NotFoundError('Người dùng không tồn tại')
    }

    const { email, fullname } = req.body

    // Kiểm tra email có đang được sử dụng bởi người khác không
    if (email) {
      const checkExistEmail = await userModel.findOne({ email })

      // Nếu email đã tồn tại và không phải của user hiện tại
      if (checkExistEmail && checkExistEmail._id.toString() !== userId) {
        throw new BadRequestError('Email đã được dùng')
      }

      existUser.email = email
    }

    if (fullname) {
      existUser.fullname = fullname
    }

    // Lưu lại user đã được cập nhật
    await existUser.save()

    return existUser
  }

  // Lấy danh sách tất cả người dùng với các trường được chọn
  getAllUsers = async () => {
    const select = { _id: 1, username: 1, fullname: 1, avatarUrl: 1 }
    return await userModel.find().select(select).lean()
  }

  // Tìm người dùng bằng từ khóa tìm kiếm
  findByFilter = async (
    { searchString },
    select = { _id: 1, username: 1, fullname: 1, status: 1, avatarUrl: 1, email: 1, type: 'friend' }
  ) => {
    const regex = new RegExp(searchString, 'i')
    const filter = {
      $or: [
        { username: { $regex: regex } },
        { fullname: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    }

    return await userModel.find(filter).select(select).lean()
  }
}

module.exports = new UserService()
