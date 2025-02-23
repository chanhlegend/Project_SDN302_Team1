const Product = require('../models/Product')
const Category = require('../models/Category')
const mongoose = require('mongoose');

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

    async getProduct(req, res, next) {
        const { id } = req.params;
        Product.findById(id)
        .populate({
            path: 'image',
        })
        .populate({
            path: 'sellerId',
            populate: {
                path: 'evaluate',
                populate: {
                    path: 'evaluaterId',
                },
            },
        })
            .then(async product => {
                if (product) {
                    const categories = await Category.find().sort({ createdAt: -1 });
                    res.render('productDetail', {product, categories});
                } else {
                    res.json({
                        message: 'failure',
                        data: 'Product not found'
                    });
                }
            })
            .catch(err => {
                res.json({
                    message: 'failure',
                    data: err.message
                });
            });
    }
}

module.exports = new productController;
