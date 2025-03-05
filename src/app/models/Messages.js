const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Messages = new Schema({
    conversation_id: { type: Schema.Types.ObjectId, ref: 'Conversations' , required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageContent: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Messages', Messages)