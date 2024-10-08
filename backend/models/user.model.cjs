const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'The fullName field is required']
    },
    email: {
      type: String,
      required: [true, 'The email field is required']
    },
    password: {
      type: String,
      required: [true, 'The password field is required']
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'busy'],
      default: 'offline'
    },
    authProvider: {
      type: String,
      default: 'Flying Kite'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    friends: [
      {
        friend_id: {
          type: Schema.Types.ObjectId,
          ref: 'Users'
        },
        status: {
          type: String,
          enum: ['accepted', 'pending'],
          default: 'pending'
        }
      }
    ],
    blocks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Users'
      }
    ],
    roles: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

module.exports = model(DOCUMENT_NAME, userSchema)
