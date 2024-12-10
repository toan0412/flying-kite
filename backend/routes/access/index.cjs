const { asyncHandler } = require('../../helpers/asyncHandler.cjs')
const accessController = require('../../controllers/access.controller.cjs')
const userController = require('../../controllers/user.controller.cjs')
const { authentication } = require('../../auth/authUtils.cjs')

const router = require('express').Router()

// sign up
router.post('/users/sign-up', asyncHandler(accessController.signUp))
router.post('/users/login', asyncHandler(accessController.login))
router.post('/auth/google', asyncHandler(accessController.loginWithGoogle))
router.patch('/users/change-password', asyncHandler(userController.changeUserPassword))
router.post('/auth/send-email', asyncHandler(accessController.sendVerificationEmail))
router.post('/auth/verify-otp', asyncHandler(accessController.verifyOTP))

router.use(authentication)
router.post('/users/block-user', asyncHandler(userController.blockUser))
router.post('/users/unblock-user', asyncHandler(userController.unblockUser))
router.get('/users', asyncHandler(userController.getAllUsers))
router.get('/users/info', asyncHandler(userController.getUser))
router.get('/users/:id', asyncHandler(userController.getUserById))
router.post('/users/search', asyncHandler(userController.searchUser))
router.post('/users/logout', asyncHandler(accessController.logout))
router.patch('/users/update', asyncHandler(userController.updateUser))

module.exports = router
