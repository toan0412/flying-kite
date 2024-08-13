const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Room';
const COLLECTION_NAME = 'Rooms';

const roomSchema = new Schema({
    roomname: {
        type: String,
        required: [true, 'The roomname field is required'],
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
        default: 'public',
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

