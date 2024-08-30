const { asyncHandler } = require('../../helpers/asyncHandler.cjs')
const accessController = require('../../controllers/access.controller.cjs')
const userController = require('../../controllers/user.controller.cjs')
const { authentication } = require('../../auth/authUtils.cjs')

const router = require('express').Router()

// sign up
router.post('/users/sign-up', asyncHandler(accessController.signUp))
router.post('/users/login', asyncHandler(accessController.login))

router.use(authentication)
router.get('/users', asyncHandler(userController.getAllUsers))
router.get('/users/:id', asyncHandler(userController.getUser))
router.post('/users/search', asyncHandler(userController.searchUser))
router.post('/users/logout', asyncHandler(accessController.logout))
router.patch('/users/update', asyncHandler(userController.updateUser))

module.exports = router
