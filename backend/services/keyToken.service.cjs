const keytokenModel = require("../models/keytoken.model.cjs");
const {Types} = require('mongoose');

//Tạo hoặc cập nhật token mới cho người dùng
class KeyTokenService {
    static createKeyToken = async({userid, publicKey, refreshToken}) => {
        try {
            
            const publicKeyString = publicKey.toString();
            const filter = {user: userid};
            const update = {user: userid, publicKey: publicKeyString, refreshTokenUsed: [], refreshToken};
            const options = {upsert: true, new: true};
            //tạo (cập nhật) token mới với filter, update, options
            const token = await keytokenModel.findOneAndUpdate(filter, update, options);
            return token ? token.publicKey : null;
        } catch (error) {
            return error
        }
    }

    static findByUserid = async(userid) => {
        return await keytokenModel.findOne({user: new Types.ObjectId(userid)}).lean();
    }

    static removeKeyById = async(id) => {
        return await keytokenModel.deleteOne({"_id": id});
    }
}

module.exports = KeyTokenService;