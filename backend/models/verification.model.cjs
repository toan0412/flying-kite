const { Schema, model } = require('mongoose')
const mongoose = require('mongoose')

const DOCUMENT_NAME = 'Verification'
const COLLECTION_NAME = 'Verifications'

const verificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'email'
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
)

verificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = model(DOCUMENT_NAME, verificationSchema)
