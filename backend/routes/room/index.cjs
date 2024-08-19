const { asyncHandler } = require('../../helpers/asyncHandler.cjs');
const roomController = require('../../controllers/room.controller.cjs');
const { authentication } = require('../../auth/authUtils.cjs');

const router = require('express').Router();

router.use(authentication);

router.get('/rooms/:userId', asyncHandler(roomController.getConversations));
router.post('/rooms', asyncHandler(roomController.getOrCreateRoom));
router.put('/rooms/:userId', asyncHandler(roomController.updateRoom));

module.exports = router;
