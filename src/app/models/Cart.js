const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cart = new Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    image: [{url: {type: String, default: ''}}],
    sellerId: { type: String, required: true },
    userId: { type: String, required: true },
    status: { type: String, default: 'unpaid' },
}, { timestamps: true });

module.exports = mongoose.model('Cart', Cart)