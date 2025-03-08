const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RegistrationForm = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('RegistrationForm', RegistrationForm);