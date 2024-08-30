const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Message'
const COLLECTION_NAME = 'Messages'

const messageSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'The room_id field is required']
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'The sender_id field is required']
    },
    content: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    isDelete: {
      type: Boolean,
      default: false
    },
    reactions: [
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        emoji: {
          type: String,
          required: [true, 'The emoji field is required']
        },
        created_at: {
          type: Date,
          default: Date.now
        }
      }
    ],
    media: [
      {
        name: {
          type: String,
          required: [true, 'The name media field is required']
        },
        url: {
          type: String,
          required: [true, 'The URL field is required']
        },
        type: {
          type: String,
          required: [true, 'The media type field is required']
        }
      }
    ]
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = model(DOCUMENT_NAME, messageSchema)
