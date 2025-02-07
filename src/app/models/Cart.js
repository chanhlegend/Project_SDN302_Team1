const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Cart = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'unpaid' },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    quantity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', Cart);