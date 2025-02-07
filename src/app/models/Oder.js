const mongoose = require('mongoose');
const { schema } = require('./User');
const Schema = mongoose.Schema;

const Order = new Schema({

    product: [{
        type: schema.types.ObjectId,
        ref: 'Product',
        required: true,
    }],

    user: {
        type: schema.types.ObjectId,
        ref: 'User',
        required: true,
    },

    totalPrice:{
        type: String,
        required: true,
        default: 0
    },
    
}, { timestamps: true })
exports.module = mongoose.model('Order', Order);

