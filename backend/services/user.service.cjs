const mongoose = require('mongoose')
const userModel = require("../models/user.model.cjs");

const findByUser = async (identifier, select = { _id: 1, username: 1, fullname: 1, status: 1 }) => {
    const query = {};

    // Kiểm tra nếu identifier là ObjectId hoặc chuỗi (username)
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        query._id = identifier;
    } else {
        query.username = identifier;
    }

    return await userModel.findOne(query).select(select).lean();
};


module.exports = {
    findByUser
}