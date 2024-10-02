const UserModel = require('../models/user.model.cjs')
const VerificationModel = require('../models/verification.model.cjs')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service.cjs')
const { createTokenPair } = require('../auth/authUtils.cjs')
const { getInfoData } = require('../utils/index.cjs')
const { BadRequestError, AuthFailureError, NotFoundError } = require('../core/error.response.cjs')
const keytokenModel = require('../models/keytoken.model.cjs')
const axios = require('axios')
const createTransporter = require('../nodemailer/init.nodemailer.cjs')

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

const generateAndSaveOTP = async ({ userId, email }) => {
  const otp = crypto.randomInt(100000, 1000000).toString()

  const fiveMinutesToSeconds = new Date(Date.now() + 5 * 60 * 1000)

  const expirationTime = fiveMinutesToSeconds

  await VerificationModel.create({
    userId,
    email,
    otp,
    type: 'email',
    expiresAt: expirationTime
  })

  return otp
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
  static login = async ({ email, password, refreshToken = null }) => {
    // Tìm người dùng theo user
    const foundUser = await UserModel.findOne({ email }).lean()
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

  static sendVerificationEmail = async (req) => {
    try {
      const { email } = req

      const existUser = await UserModel.findOne({ email: email })

      if (!existUser) {
        throw new NotFoundError('Không tìm thấy người dùng')
      }

      const existOTP = await VerificationModel.findOne({ userId: existUser._id, email: email })

      if (existOTP) {
        await VerificationModel.findByIdAndDelete(existOTP._id)
      }

      const transporter = await createTransporter()

      const otp = await generateAndSaveOTP({ userId: existUser._id, email })

      if (!otp) {
        throw new BadRequestError('Không tạo được mã OTP mới')
      }

      const mailOptions = {
        from: `"Flying Kite" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Xác nhận địa chỉ email của bạn',
        html: `
          <h1>Xác nhận email từ Flying Kite</h1>
          <p>Cảm ơn đã sử dụng dịch vụ của chúng tôi, vui lòng sử dụng mã sau để xác nhận địa chỉ email của bạn:</p>
          <h2>${otp}</h2>
          <p>Lưu ý: Mã này sẽ hết hạn sau 5 phút.</p>
        `
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.response)

      return {
        _id: existUser._id,
        email: existUser.email,
        fullName: existUser.fullName,
        avatarUrl: existUser.avatarUrl
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  static verifyOTP = async (req) => {
    try {
      const { userId, email, inputOTP } = req
      const verification = await VerificationModel.findOne({
        userId,
        email,
        otp: inputOTP,
        expiresAt: { $gt: new Date() }
      })

      if (!verification) {
        throw new NotFoundError('Không tìm thấy OTP Model')
      }

      await VerificationModel.deleteOne({ _id: verification._id })

      await UserModel.updateOne(
        { _id: userId },
        { $set: { isEmailVerified: true, authProvider: 'Google' } }
      )

      const updatedUser = await UserModel.findOne({ _id: userId })
        .select('_id fullName email avatarUrl status isEmailVerified')
        .lean()

      return updatedUser
    } catch (error) {
      console.error('Error when verify email:', error)
      throw new BadRequestError('Xảy ra lỗi khi xác thực OTP')
    }
  }

  // Phương thức đăng ký
  static signUp = async ({ fullName, email, password, avatarUrl }) => {
    const gmailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/

    const validGmail = gmailRegex.test(email.toLowerCase())

    if (!validGmail) {
      throw new BadRequestError('Địa chỉ email không hợp lệ. Vui lòng sử dụng địa chỉ Gmail.')
    }

    const checkExistEmail = await UserModel.findOne({ email }).lean()
    if (checkExistEmail) {
      throw new BadRequestError('Địa chỉ Gmail này đã được dùng')
    }

    // Mã hóa mật khẩu trước khi lưu
    const passwordHash = await bcrypt.hash(password, 10)

    // Tạo người dùng mới
    const newUser = await UserModel.create({
      fullName,
      email,
      password: passwordHash,
      avatarUrl,
      roles: [RoleUser.USER]
    })

    if (newUser) {
      const tokens = await genToken(newUser)
      return {
        user: getInfoData({ field: ['_id', 'email', 'email'], object: newUser }),
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
