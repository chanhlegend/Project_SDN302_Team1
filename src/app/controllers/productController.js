const Product = require('../models/Product');

class ProductController {
    async listProduct(req, res, next) {
        try {
            const products = await Product.find({});
            res.json({
                message: 'success',
                data: products
            });
        } catch (err) {
            res.json({
                message: 'failure',
                data: []
            });
        }
    }
   
}

module.exports = new ProductController();
