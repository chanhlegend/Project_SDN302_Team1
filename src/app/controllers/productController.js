const Product = require('../models/Product');
const Image = require('../models/Image');
const Category = require('../models/Category')
const mongoose = require('mongoose');
class ProductController {
    // Lấy danh sách sản phẩm
    async listProduct(req, res, next) {
        try {
            const products = await Product.find({}).populate('sellerId', 'name email');
            res.render('admin', { products });
        } catch (err) {
            res.status(500).send("Lỗi server");
        }
    }

    // Lấy thông tin chi tiết sản phẩm
    async getProductDetail(req, res, next) {
        try {
            const productId = req.params.productId;
            const product = await Product.findById(productId)
                .populate('sellerId', 'name email') // Populate thông tin người bán
                .populate('image', 'url'); // Populate thông tin hình ảnh

            if (!product) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại" });
            }

            res.json(product);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    async createProduct(req, res, next) {
        const { productName, price, description, sellerId, status, category } = req.body
        const product = new Product({
            productName,
            price,
            description,
            sellerId,
            category
        });

        try {
            await product.save();
            res.redirect('/admin/products');
        } catch (err) {
            res.status(500).send("Lỗi khi tạo sản phẩm");
        }
    }
    // Duyệt sản phẩm
    async approveProduct(req, res, next) {
        const productId = req.params.productId;
        try {
            const product = await Product.findByIdAndUpdate(productId, { status: 'active' }, { new: true });
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            res.json({ message: 'Sản phẩm đã được duyệt', data: product });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Từ chối sản phẩm
    async rejectProduct(req, res, next) {
        const productId = req.params.productId;
        try {
            const product = await Product.findByIdAndUpdate(productId, { status: 'rejected' }, { new: true });
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            res.json({ message: 'Sản phẩm đã bị từ chối', data: product });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server' });
        }
    }

    // Cập nhật nhiều sản phẩm
    async updateMultipleProducts(req, res, next) {
        const { productIds, status } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'Danh sách sản phẩm không hợp lệ' });
        }

        try {
            await Product.updateMany(
                { _id: { $in: productIds } },
                { $set: { status: status } }
            );
            res.json({ message: "Cập nhật ${productIds.length} sản phẩm thành ${status} " });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái' });
        }
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
                res.render('productDetail', { product, categories });
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

module.exports = new ProductController;

