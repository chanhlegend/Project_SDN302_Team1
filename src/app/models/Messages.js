const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Messages = new Schema({
    conversation_id: { type: String, required: true },
    senderId: { type: String, required: true },
    messageContent: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Messages', Messages)