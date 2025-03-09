const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    product: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    }],

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },

    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },

    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
