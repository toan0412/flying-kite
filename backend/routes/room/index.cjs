const { asyncHandler } = require('../../helpers/asyncHandler.cjs');
const roomController = require('../../controllers/room.controller.cjs');
const { authentication } = require('../../auth/authUtils.cjs');

const router = require('express').Router();

router.use(authentication);

router.get('/rooms', asyncHandler(roomController.getConversations));
router.post('/rooms', asyncHandler(roomController.createRoom));
router.put('/rooms/:id', asyncHandler(roomController.updateRoom));
router.patch('/rooms/:id', asyncHandler(roomController.updateRoom));
router.delete('/rooms/:id', asyncHandler(roomController.deleteRoom));

module.exports = router;
