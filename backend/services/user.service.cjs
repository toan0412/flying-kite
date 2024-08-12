const userModel = require("../models/user.model.cjs");

const findByUser = async (username, select = {
    username: 1,fullname: 1, password: 1,email: 1, status: 1, roles: 1
}) => {
    return await userModel.findOne({username}).select(select).lean();
};

module.exports = {
    findByUser
}