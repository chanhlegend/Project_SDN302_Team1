const Product = require('../models/Product');

class productController {
    listProduct(req, res, next) {
        Product.find({})
            .then(products => {
                res.json({
                    message: 'success',
                    data: products
                })
            })
            .catch(err => {
                res.json({
                    message: 'failure',
                    data: []
                })
            })
    }
  
    createProduct = (req, res, next) => {
        const { productName, price, description, sellerId, status, category } = req.body
        const product = new Product({
            productName,
            price,
            description,
            sellerId,
            status,
            category
        })
        product.save()
            .then(product => {
                res.json({
                    message: 'success',
                    data: product
                })
            })
            .catch(err => {
                res.json({
                    message: 'failure',
                    data: []
                })
            })
    }
}

module.exports = new ProductController();
