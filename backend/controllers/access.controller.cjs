const AccessService = require('../services/access.service.cjs')
const { SuccessResponse, CREATED } = require('../core/success.response.cjs')

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.login(req.body)
    }).send(res)
  }

  loginWithGoogle = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.loginWithGoogle(req.body)
    }).send(res)
  }

  sendVerificationEmail = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.sendVerificationEmail(req.body)
    }).send(res)
  }

  verifyOTP = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.verifyOTP(req.body)
    }).send(res)
  }

  logout = async (req, res, next) => {
    new SuccessResponse({
      data: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  signUp = async (req, res, next) => {
    new CREATED({
      message: 'Register OK',
      data: await AccessService.signUp(req.body)
    }).send(res)
  }
}

module.exports = new AccessController()
