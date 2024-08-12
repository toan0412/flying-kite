const userModel = require('../models/user.model.cjs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service.cjs');
const { createTokenPair } = require('../auth/authUtils.cjs');
const { getInfoData } = require('../utils/index.cjs');
const { BadRequestError, AuthFailureError } = require('../core/error.response.cjs');
const { findByUser } = require('./user.service.cjs');
const keytokenModel = require("../models/keytoken.model.cjs");

// Các vai trò người dùng
const RoleUser = {
    USER: 'USER',
    ADMIN: 'ADMIN'
}

// Hàm lấy khóa công khai của người dùng từ cơ sở dữ liệu
const getPublicKey = async (userid) => {
    const filter = { user: userid };
    const token = await keytokenModel.findOne(filter);
    return token.publicKey;
}

// Hàm xác thực token bằng khóa công khai
const validateToken = async (accessToken, userID) => {
    // Lấy khóa công khai từ cơ sở dữ liệu
    const publicKeyString = await getPublicKey(userID);
    // Chuyển đổi khóa công khai từ chuỗi sang đối tượng RSA
    const publicKeyObject = crypto.createPublicKey(publicKeyString);
    // Xác thực accessToken bằng khóa công khai
    jwt.verify(accessToken, publicKeyObject, (err, decode) => {
        if (err) {
            console.error('Error verifying token:', err);
        } else {
            console.log('Decoded JWT:', decode);
        }
    });
}

// Hàm tạo hoặc cập nhật khóa token trong cơ sở dữ liệu
const createKeyToken = async ({ userid, publicKey, refreshToken }) => {
    const publicKeyString = publicKey.toString();
    const filter = { user: userid };
    const update = { user: userid, publicKey: publicKeyString };
    const options = { upsert: true, new: true };
    await keytokenModel.findOneAndUpdate(filter, update, options);
}

// Hàm tạo accessToken dựa trên payload và privateKey
const createAccessToken = async (payload, privateKey) => {
    const { accessToken } = await createTokenPair(payload, privateKey);
    return accessToken;
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
    });

    // Lưu userID và publicKey vào bảng KeyToken
    await createKeyToken({ userid: userInfo._id, publicKey });

    // Tạo accessToken với privateKey
    const accessToken = await createAccessToken({ userid: userInfo._id, email: userInfo.email }, privateKey);
    return { accessToken, publicKey };
}

class AccessService {
    // Phương thức đăng xuất
    static logout = async (keyStore) => {
        console.log('Key store:', keyStore);
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log('Deleted key:', delKey);
        return delKey;
    }

    // Phương thức đăng nhập
    static login = async ({ username, password, refreshToken = null }) => {
        // Tìm người dùng theo user
        const foundUser = await findByUser(username);
        if (!foundUser) throw new BadRequestError('User not registered');

        // So sánh mật khẩu đã mã hóa
        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) throw new AuthFailureError('Authentication error');

        // Tạo token cho người dùng
        const tokens = await genToken(foundUser);

        // Lưu key token vào cơ sở dữ liệu
        await KeyTokenService.createKeyToken({
            userid: foundUser._id,
            publicKey: tokens.publicKey,
            refreshToken: tokens.refreshToken
        });

        return {
            user: getInfoData({ field: ["_id", "name", "user"], object: foundUser }),
            tokens
        };
    }

    // Phương thức đăng ký
    static signUp = async ({ fullname, email, password, username }) => {
        // Kiểm tra xem shop đã tồn tại chưa
        const checkExistUser = await userModel.findOne({ username }).lean();
        if (checkExistUser) {
            throw new BadRequestError('Error: User exists');
        }

        // Mã hóa mật khẩu trước khi lưu
        const passwordHash = await bcrypt.hash(password, 10);

        // Tạo người dùng mới
        const newUser = await userModel.create({
            username, fullname, email, password: passwordHash, roles: [RoleUser.USER]
        });

        if (newUser) {
            const tokens = await genToken(newUser);
            return {
                user: getInfoData({ field: ["_id", "username", "email"], object: newUser }),
                tokens
            };
        }
        return {
            code: 200,
            newdata: null
        };
    }
}

module.exports = AccessService;
