const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    first_name: { type: String, default: 'User' },
    last_name: { type: String, },
    dob: { type: Date },
    role: { type: String, default: 'user' },
    avatar: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String },
    email: { type: String, required: true },
    status: { type: String, default: 'active' },
    evaluate: [{ type: Schema.Types.ObjectId, ref: 'Evaluate' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'Follower' }],
    gender: {type: Boolean, default: true},
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);