const AccessService = require("../services/access.service.cjs");
const { SuccessResponse, CREATED } = require('../core/success.response.cjs');

class AccessController {
    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res);
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Register OK',
            metadata: await AccessService.signUp(req.body)
        }).send(res);
    }
}

module.exports = new AccessController();