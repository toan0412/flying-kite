const { getAll, getOneById, postOne, updateOne, deleteOne } = require('./common.controller.cjs');
const Room = require('../models/room.model.cjs');

const roomController = {
  getAllRooms: (req, res) => {
    return getAll(Room)(req, res);
  },

  getRoomById: (req, res) => {
    return getOneById(Room)(req, res);
  },

  createRoom: (req, res) => {
    console.log(req)
    return postOne(Room)(req, res);
  },

  updateRoom: (req, res) => {
    return updateOne(Room)(req, res);
  },

  deleteRoom: (req, res) => {
    return deleteOne(Room)(req, res);
  }
};

module.exports = roomController;
