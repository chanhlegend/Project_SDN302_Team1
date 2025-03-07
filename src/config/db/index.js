const mongoose = require('mongoose');
require('dotenv').config({ path: './src/.env' });

// Lấy URL từ .env
const { MONGO_URI } = process.env;

// Hàm kết nối đến MongoDB
async function connect() {
    if (!MONGO_URI) {
        console.error('MONGO_URI is not defined in .env file');
        return;
    }

    try {
        mongoose.set('strictQuery', false); // Tùy chọn: giảm cảnh báo trong phiên bản mới
        await mongoose.connect(MONGO_URI, {

        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
    }
}

module.exports = { connect };
