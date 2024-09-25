const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'Notifications'

const notificationSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },

    content: {
      type: String,
      required: [true, 'The message field is required']
    },

    isRead: {
      type: Boolean,
      default: false
    },

    type: {
      type: String,
      enum: ['Room', 'System'],
      default: 'Room'
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = model(DOCUMENT_NAME, notificationSchema)
