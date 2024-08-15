const { asyncHandler } = require('../../helpers/asyncHandler.cjs');
const messageController = require('../../controllers/message.controller.cjs');
const { authentication } = require('../../auth/authUtils.cjs');

const router = require('express').Router();

router.use(authentication);

router.post('/messages', asyncHandler(messageController.createMessage))
router.get('/messages/:roomId', asyncHandler(messageController.getMessageByRoom))

module.exports = router;
