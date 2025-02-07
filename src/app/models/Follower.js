const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowerSchema = new Schema({
    followerId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Follower', FollowerSchema);