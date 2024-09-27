const UserModel = require('../models/user.model.cjs')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service.cjs')
const { createTokenPair } = require('../auth/authUtils.cjs')
const { getInfoData } = require('../utils/index.cjs')
const { BadRequestError, AuthFailureError } = require('../core/error.response.cjs')
const keytokenModel = require('../models/keytoken.model.cjs')
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')

// Các vai trò người dùng
const RoleUser = {
  USER: 'user',
  ADMIN: 'admin'
}

// Hàm tạo hoặc cập nhật khóa token trong cơ sở dữ liệu
const createKeyToken = async ({ userid, publicKey, refreshToken }) => {
  const publicKeyString = publicKey.toString()
  const filter = { user: userid }
  const update = { user: userid, publicKey: publicKeyString }
  const options = { upsert: true, new: true }
  await keytokenModel.findOneAndUpdate(filter, update, options)
}

// Hàm tạo accessToken dựa trên payload và privateKey
const createAccessToken = async (payload, privateKey) => {
  const { accessToken } = await createTokenPair(payload, privateKey)
  return accessToken
}

//Xác thực token google
async function getUserInfo(accessToken) {
  try {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user info:', error)
    return null
  }
}

// Hàm tạo token cho người dùng mới
const genToken = async (userInfo) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    }
  })

  // Lưu userID và publicKey vào bảng KeyToken
  await createKeyToken({ userid: userInfo._id, publicKey })

  // Tạo accessToken với privateKey
  const accessToken = await createAccessToken(
    { userid: userInfo._id, email: userInfo.email },
    privateKey
  )
  return { accessToken, publicKey }
}

class AccessService {
  // Phương thức đăng xuất
  static logout = async (keyStore) => {
    console.log('Key store:', keyStore)
    const delKey = await KeyTokenService.removeKeyById(keyStore._id)
    console.log('Deleted key:', delKey)
    return delKey
  }

  // Phương thức đăng nhập
  static login = async ({ username, password, refreshToken = null }) => {
    // Tìm người dùng theo user
    const foundUser = await UserModel.findOne({ username }).lean()
    if (!foundUser) throw new BadRequestError('Không tìm thấy người dùng')

    // So sánh mật khẩu đã mã hóa
    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) throw new AuthFailureError('Tài khoản hoặc mật khẩu sai')

    // Tạo token cho người dùng
    const tokens = await genToken(foundUser)

    // Lưu key token vào cơ sở dữ liệu
    await KeyTokenService.createKeyToken({
      userid: foundUser._id,
      publicKey: tokens.publicKey,
      refreshToken: tokens.refreshToken
    })

    return {
      user: getInfoData({ field: ['_id', 'name', 'user'], object: foundUser }),
      tokens
    }
  }

  static loginWithGoogle = async (req) => {
    try {
      const { accessToken } = req
      const userInfo = await getUserInfo(accessToken)
      if (!userInfo) {
        throw new AuthFailureError('Không thể lấy thông tin người dùng từ Google')
      }

      const { email, name, picture, email_verified } = userInfo

      // Kiểm tra xem người dùng đã tồn tại trong database chưa
      let user = await UserModel.findOne({ email }).lean()

      if (!user) {
        // Nếu chưa tồn tại, tạo người dùng mới
        const newUser = new UserModel({
          email,
          fullName: name,
          avatarUrl: picture,
          username: email,
          roles: [RoleUser.USER],
          authProvider: 'Google',
          isEmailVerified: email_verified,
          password: crypto.randomBytes(16).toString('hex')
        })
        user = await newUser.save()
      }

      // Tạo token cho người dùng
      const tokens = await genToken(user)

      // Lưu key token vào cơ sở dữ liệu
      await KeyTokenService.createKeyToken({
        userid: user._id,
        publicKey: tokens.publicKey,
        refreshToken: tokens.refreshToken
      })

      return {
        user: getInfoData({ field: ['_id', 'fullName', 'email', 'avatarUrl'], object: user }),
        tokens
      }
    } catch (error) {
      console.error('Error in Google login:', error)
      throw new AuthFailureError('Đăng nhập Google thất bại')
    }
  }

  // Phương thức đăng ký
  static signUp = async ({ fullName, email, password, username, avatarUrl }) => {
    const checkExistEmail = await UserModel.findOne({ email }).lean()
    if (checkExistEmail) {
      throw new BadRequestError('Email đã được dùng')
    }

    // Kiểm tra xem user đã tồn tại chưa
    const checkExistUser = await UserModel.findOne({ username }).lean()
    if (checkExistUser) {
      throw new BadRequestError('Người dùng đã tồn tại')
    }

    // Mã hóa mật khẩu trước khi lưu
    const passwordHash = await bcrypt.hash(password, 10)

    // Tạo người dùng mới
    const newUser = await UserModel.create({
      username,
      fullName,
      email,
      password: passwordHash,
      avatarUrl,
      roles: [RoleUser.USER]
    })

    if (newUser) {
      const tokens = await genToken(newUser)
      return {
        user: getInfoData({ field: ['_id', 'username', 'email'], object: newUser }),
        tokens
      }
    }
    return {
      code: 200,
      newdata: null
    }
  }
}

module.exports = AccessService
