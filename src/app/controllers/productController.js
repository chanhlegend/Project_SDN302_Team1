const Product = require('../models/Product')
const Category = require('../models/Category')
const { mutipleMongoeseToObject } = require('../../util/Mongoese')
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
    
}

class SellerProductController {
    async getMyProducts(req, res, next) {
        try {
            const userId = new mongoose.Types.ObjectId("67a8a9da29baf8965b18f434");

            // Lấy page và limit từ query, nếu không có thì mặc định page = 1, limit = 10
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            let skip = (page - 1) * limit;

            // Tổng số sản phẩm của seller
            const totalProducts = await Product.countDocuments({ sellerId: userId });

            // Lấy danh sách sản phẩm theo trang
            const products = await Product.find({ sellerId: userId })
                .populate('category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Tính số trang
            const totalPages = Math.ceil(totalProducts / limit);

            // Thống kê
            const stats = {
                totalProducts,
                activeProducts: await Product.countDocuments({ sellerId: userId, status: 'active' }),
                pendingProducts: await Product.countDocuments({ sellerId: userId, status: 'pending' }),
                soldProducts: await Product.countDocuments({ sellerId: userId, status: 'sold' })
            };

            res.render('statics', {
                title: 'My Products',
                products: mutipleMongoeseToObject(products),
                stats,
                user: req.user,
                currentPage: page,
                totalPages,
                limit
            });

        } catch (error) {
            console.error('Error in getMyProducts:', error);
            req.session.message = {
                type: 'error',
                content: 'Failed to load products'
            };
            res.redirect('/');
        }
    }
}



module.exports = {
    productController: new productController(),
    sellerProductController: new SellerProductController()
};