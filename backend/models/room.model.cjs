const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Room'
const COLLECTION_NAME = 'Rooms'

const roomSchema = new Schema({
  roomName: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'The created_by field is required'],
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'The user_id in members is required']
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }
  ],
  avatar: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: COLLECTION_NAME
}
)

roomSchema.index({ 'members.user_id': 1 })

module.exports = model(DOCUMENT_NAME, roomSchema)
