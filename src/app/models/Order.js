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

    status:{
        type: String,
        require: true,
        default:'Pending'
    }
    
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
