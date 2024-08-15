const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Message';
const COLLECTION_NAME = 'Messages';

const messageSchema = new Schema({
    room_id: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'The room_id field is required'],
    },
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The sender_id field is required'],
    },
    content: {
        type: String,
        required: [true, 'The content field is required'],
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    reactions: [{
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        emoji: {
            type: String,
            required: [true, 'The emoji field is required'],
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
    }],
    media: [{
        url: {
            type: String,
            required: [true, 'The URL field is required'],
        },
        type: {
            type: String,
            enum: ['image', 'video', 'audio'],
            required: [true, 'The media type field is required'],
        }
    }],
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DOCUMENT_NAME, messageSchema);
