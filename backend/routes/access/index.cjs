const { asyncHandler } = require('../../helpers/asyncHandler.cjs');
const accessController = require('../../controllers/access.controller.cjs')
const { authentication } = require('../../auth/authUtils.cjs');

const router = require('express').Router()


// sign up
router.post('/user/sign-up', asyncHandler(accessController.signUp));
router.post('/user/login', asyncHandler(accessController.login));

router.use(authentication);
router.post('/user/logout', asyncHandler(accessController.logout));

module.exports  = router
