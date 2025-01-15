const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Product = new Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    image: [{url: {type: String, default: ''}}],
    sellerId: { type: String, required: true },
    status: { type: String, default: 'active' },
    category: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', Product)