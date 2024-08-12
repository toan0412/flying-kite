const { findById } = require("../services/apiKey.service.cjs");
const { FobiddenError } = require('../core/error.response.cjs');

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    console.log(req.headers)
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
        throw new FobiddenError('x-api-key is missing');
    }
    const objKey = await findById(key);
    if (!objKey) {
        throw new FobiddenError('objKey is missing');
    }
    req.objKey = objKey;
    return next();
}

const permission = (permission) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            throw new FobiddenError('Permission Required');
        }
        const validatePermission = req.objKey.permissions.includes(permission);
        if (!validatePermission) {
            throw new FobiddenError('Permission Required');
        } else {
            next();
        }
    }
}

module.exports = {
    apiKey,
    permission
}