const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Notification';
const COLLECTION_NAME = 'Notifications';

const notificationSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'The user_id field is required'],
    },
    message: {
        type: String,
        required: [true, 'The message field is required'],
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['request', 'notification'],
        required: [true, 'The type field is required'],
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DOCUMENT_NAME, notificationSchema);
