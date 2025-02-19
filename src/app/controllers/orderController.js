const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order')
class orderController {
    async createOrder(req, res, next) {
        const { productId, userId, totalPrice} = req.body;
        
        try {
            const product = await Product.findById(productId);
            
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const order = new Order({
                product: productId,
                user: userId,
                totalPrice: totalPrice
            });
            await order.save();
            res.status(201).json(order);
            }
         catch (error) {
            next(error);  
        }
    }
}

module.exports = new orderController;
