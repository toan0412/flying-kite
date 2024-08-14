const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Room';
const COLLECTION_NAME = 'Rooms';

const roomSchema = new Schema({
    roomname: {
        type: String,
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'The created_by field is required'],
    },
    members: [{
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
            required: [true, 'The user_id in members is required']
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member',
        }
    }],
    avatar: {
        type: String,
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'private',
    },
    last_message: {
        type: String,
        default: '',
    },
    last_message_at: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DOCUMENT_NAME, roomSchema);

