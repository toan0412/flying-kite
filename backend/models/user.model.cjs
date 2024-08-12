const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Users';
const COLLECTION_NAME = 'Users';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg', 
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy'],
        default: 'offline',
    },
    friends: [{
        friend_id: {
            type: Schema.Types.ObjectId,
            ref: 'Users',
        },
        status: {
            type: String,
            enum: ['accepted', 'pending'],
            default: 'pending',
        },
    }],
    block_list: [{
        type: Schema.Types.ObjectId,
        ref: 'Users',
    }],
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DOCUMENT_NAME, userSchema);
