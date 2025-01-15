const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EvaluateSchema = new Schema({
    star: { type: Number },
    evaluaterId: { type: String }
});

const FollowerSchema = new Schema({
    followerId: { type: String }
});

const User = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String },
    dob: { type: Date },
    role: { type: String, default: 'user' },
    avatar: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, required: true},
    email: { type: String, required: true },
    status: { type: String, default: 'active' },
    evaluate: [EvaluateSchema],
    followers: [FollowerSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', User)