const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);