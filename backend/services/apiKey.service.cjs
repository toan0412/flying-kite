const apikeyModel = require("../models/apikey.model.cjs")

const findById = async (key) => {
    const objKey = await apikeyModel.findOne({ key, status: true }).lean();
    return objKey;
}

module.exports = {
    findById
}