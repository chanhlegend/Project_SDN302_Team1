const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    image: [{ type: Schema.Types.ObjectId, ref: 'Image' }],
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'non-active' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', Product);