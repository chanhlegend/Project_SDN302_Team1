const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Conversations = new Schema({
    participants: [{userId: {type: String}}]
}, { timestamps: true });

module.exports = mongoose.model('Conversations', Conversations)