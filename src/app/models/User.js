const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const User = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, default: 'Người dùng' },
    dob: { type: Date },
    role: { type: String, default: 'user' },
    avatar: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String },
    email: { type: String, required: true },
    status: { type: String, default: 'non-active' },
    evaluate: [{
        star: { type: Number },
        evaluaterId: { type: String }
    }],
    followers: [{
        followerId: { type: String }
    }]
});

module.exports = mongoose.model('User', User);