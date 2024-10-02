const UserModel = require('../models/user.model.cjs')
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs')
const { getInfoData } = require('../utils/index.cjs')
const bcrypt = require('bcrypt')

class UserService {
  // Tìm người dùng bằng id
  getUserById = async (req) => {
    const { id } = req.params
    const existUser = await UserModel.findById(id).lean()

    if (!existUser) {
      throw new NotFoundError('Người dùng không tồn tại')
    }

    return getInfoData({
      field: ['_id', 'fullName', 'email', 'avatarUrl', 'status', 'isEmailVerified'],
      object: existUser
    })
  }

  // Lấy thông tin người dùng theo ID từ header
  getUser = async (req) => {
    const userId = req.headers['x-client-id']
    const user = await UserModel.findById(userId).lean()
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại')
    }
    return getInfoData({
      field: ['_id', 'fullName', 'email', 'avatarUrl', 'status', 'isEmailVerified'],
      object: user
    })
  }

  //Cập nhật thông tin người dùng
  updateUser = async (req) => {
    const userId = req.headers['x-client-id']

    // Chuyển đổi userId thành ObjectId (Mongoose sẽ tự động chuyển đổi nếu nó là chuỗi hợp lệ)
    const existUser = await UserModel.findById(userId)

    if (!existUser) {
      throw new NotFoundError('Người dùng không tồn tại')
    }

    const { email, fullName } = req.body

    // Kiểm tra email có đang được sử dụng bởi người khác không
    if (email) {
      const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/
      const checkExistEmail = await UserModel.findOne({ email })

      const validGmail = gmailRegex.test(email)

      if (!validGmail) {
        throw new BadRequestError('Địa chỉ email không hợp lệ. Vui lòng sử dụng địa chỉ Gmail.')
      }

      if (checkExistEmail && checkExistEmail._id.toString() !== userId) {
        throw new BadRequestError('Địa chỉ Gmail này đã được dùng')
      }

      existUser.email = email
      existUser.isEmailVerified = false
      existUser.authProvider = 'Flying Kite'
    }

    if (fullName) {
      existUser.fullName = fullName
    }

    // Lưu lại user đã được cập nhật
    await existUser.save()

    return existUser
  }

  changeUserPassword = async (req) => {
    const { userId, email, newPassword } = req

    const existUser = await UserModel.findOne({ _id: userId, email: email })

    if (!existUser) {
      throw new NotFoundError('Không tìm thấy người dùng')
    }

    // Mã hóa mật khẩu trước khi lưu
    const passwordHash = await bcrypt.hash(newPassword, 10)

    existUser.password = passwordHash

    await existUser.save()

    return existUser
  }

  // Lấy danh sách tất cả người dùng với các trường được chọn
  getAllUsers = async () => {
    const select = { _id: 1, email: 1, fullName: 1, avatarUrl: 1 }
    return await UserModel.find().select(select).lean()
  }

  // Tìm người dùng bằng từ khóa tìm kiếm
  findByFilter = async (
    { searchString },
    select = { _id: 1, fullName: 1, status: 1, avatarUrl: 1, email: 1, type: 'friend' }
  ) => {
    const regex = new RegExp(searchString, 'i')
    const filter = {
      $or: [{ fullName: { $regex: regex } }, { email: { $regex: regex } }]
    }

    return await UserModel.find(filter).select(select).lean()
  }
}

module.exports = new UserService()
