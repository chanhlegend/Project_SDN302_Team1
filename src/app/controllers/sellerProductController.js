const Product = require('../models/Product');
const { mutipleMongoeseToObject } = require('../../util/Mongoese');
const mongoose = require('mongoose');

class SellerDashboardController {
    async getMyProducts(req, res, next) {
        console.log("Session: " , req.session);
        try {
 
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                req.session.message = {
                    type: 'error',
                    content: 'Bạn cần đăng nhập để xem sản phẩm của mình'
                };
                return res.redirect('/login');
            }

            const sellerId = new mongoose.Types.ObjectId(userId);
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;
            let skip = (page - 1) * limit;

            const totalProducts = await Product.countDocuments({ sellerId });
            const products = await Product.find({ sellerId })
                .populate('category')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalPages = Math.ceil(totalProducts / limit);
            const stats = {
                totalProducts,
                activeProducts: await Product.countDocuments({ sellerId, status: 'active' }),
                pendingProducts: await Product.countDocuments({ sellerId, status: 'pending' }),
                soldProducts: await Product.countDocuments({ sellerId, status: 'sold' })
            };

            res.render('statics', {
                title: 'Sản phẩm của tôi',
                products: mutipleMongoeseToObject(products),
                stats,
                user: req.user,
                currentPage: page,
                totalPages,
                limit
            });

        } catch (error) {
            console.error('Lỗi trong getMyProducts:', error);
            req.session.message = {
                type: 'error',
                content: 'Không thể tải danh sách sản phẩm'
            };
            res.redirect('/');
        }
    }
}

module.exports = new SellerDashboardController;
