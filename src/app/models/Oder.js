const mongoose = require('mongoose');
const { schema } = require('./User');
const Schema = mongoose.Schema;

const Order = new Schema({

    Product: [{
        type: schema.types.ObjectId,
        ref: 'Product',
        required: true,
    }],

    User: {
        type: schema.types.ObjectId,
        ref: 'User',
        required: true,
    },

    price:{
        type: String,
        required: true,
        default: 0
    },
    
}, { timestamps: true })
exports.module = mongoose.model('Order', Order);

