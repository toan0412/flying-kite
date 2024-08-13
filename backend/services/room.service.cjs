const userModel = require("../models/room.model.cjs");

const findByRoom = async (username, select = {
    username: 1,fullname: 1, password: 1,email: 1, status: 1, roles: 1
}) => {
    return await userModel.findOne({username}).select(select).lean();
};

module.exports = {
    findByRoom
}