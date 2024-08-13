const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'Users';

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'The username field is required'],
        unique: true,
    },
    fullname: {
        type: String,
        required: [true, 'The fullname field is required'],
    },
    email: {
        type: String,
        required: [true, 'The email field is required'],
    },
    password: {
        type: String,
        required: [true, 'The password field is required'],
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
    roles: {
        type: Array,
        default: []
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

module.exports = model(DOCUMENT_NAME, userSchema);