const express = require('express');
const app = express(); // Khởi tạo ứng dụng Express
const http = require('http').Server(app);
const mongoose = require('mongoose');
const User = require('./model/user.model.cjs'); // Import User model

(async function connectDB() {
    console.log('Attempting to connect to MongoDB Atlas...');
    try {
        await mongoose.connect('mongodb+srv://truongtoan00189:hAWT4jvSPyzMs9C0@cluster0.il30m.mongodb.net/realtimechat?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to MongoDB Atlas');

        // Chèn dữ liệu vào MongoDB
        const newUser = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'securepassword123'
        });

        await newUser.save();
        console.log('New user has been inserted into the database.');

    } catch (error) {
        console.error('Error connecting to MongoDB Atlas or inserting data:', error);
    }
})();

http.listen(3000, function(){
    console.log('Server is running');
});
