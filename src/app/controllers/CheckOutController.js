const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category')
class CheckOutController {
    async listCheckout(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const user = req.session.user;
        const productIdsStr = req.body.productIds;
        const productIds = JSON.parse(productIdsStr);
        
       
        const products = await Product.find({ _id: { $in: productIds } })
            .populate('sellerId', 'name')
            .populate('image');
        
        const categories = await Category.find().sort({ createdAt: -1 });
        let totalPrice = 0;
        for (const product of products) {
            totalPrice += product.price;
        }
        totalPrice += 7000; 
        
       
        res.render('checkout', { products, user, totalPrice , categories});
    }
}

module.exports = new CheckOutController;