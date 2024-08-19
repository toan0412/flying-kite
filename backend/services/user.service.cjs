const mongoose = require('mongoose')
const userModel = require("../models/user.model.cjs");
const { BadRequestError, NotFoundError } = require('../core/error.response.cjs');
const { getInfoData } = require('../utils/index.cjs');

class UserService {
    findByUser = async (identifier) => {
        const query = {};

        // Kiểm tra nếu identifier là ObjectId hoặc chuỗi (username)
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            query._id = identifier;
        } else {
            query.username = identifier;
        }

        const existUser = await userModel.findOne(query).lean()
        if (!existUser) {
            throw new NotFoundError('Không tìm thấy người dùng');
        }
        return existUser
    }

    //Lấy thông tin người dùng theo ID
    getUser = async (req) => {
        const userId = req.headers['x-client-id']
        const user = await userModel.findById(userId).lean();
        return {
            user: user,
        };
    }

    //Lấy danh sách tất cả người dùng
    getAllUsers = async () => {
        const select = { _id: 1, username: 1, fullname: 1, avatarUrl: 1 }
        return await userModel.find().select(select).lean()
    };

    findByFilter = async ({ searchString }, select = { _id: 1, username: 1, fullname: 1, status: 1, avatarUrl: 1, email: 1 }) => {
        const regex = new RegExp(searchString, 'i');
        const filter = {
            $or: [
                { username: { $regex: regex } },
                { fullname: { $regex: regex } },
                { email: { $regex: regex } }
            ]
        };

        return await userModel.find(filter).select(select).lean();
    }

}


module.exports = new UserService()