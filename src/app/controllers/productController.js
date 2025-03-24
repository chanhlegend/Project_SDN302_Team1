const Product = require('../models/Product');
const Image = require('../models/Image');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const Follower = require('../models/Follower');
const User = require('../models/User');
const mongoose = require('mongoose');
class ProductController {
    // Lấy danh sách sản phẩm
    async listProduct(req, res, next) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.redirect('/login'); 
        }
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
            const product = await Product.findByIdAndUpdate(
                productId,
                { status: 'active' },
                { new: true }
            ).populate('sellerId');

            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

            const io = req.app.get('io');

            // Tạo và gửi thông báo cho người bán
            const sellerNotification = new Notification({
                userId: product.sellerId._id,
                title: 'Sản phẩm đã được duyệt',
                message: `Sản phẩm "${product.productName}" của bạn đã được duyệt.`,
            });
            await sellerNotification.save();

            io.to(product.sellerId._id.toString()).emit('notification', {
                title: 'Sản phẩm đã được duyệt',
                message: `Sản phẩm "${product.productName}" của bạn đã được duyệt.`,
                createdAt: new Date()
            });

            // Gửi thông báo cho người theo dõi
            const followers = await Follower.find({ followingId: product.sellerId._id });
            for (const follower of followers) {
                const followerNotification = new Notification({
                    userId: follower.followerId,
                    title: 'Sản phẩm mới từ người bạn theo dõi',
                    message: `Sản phẩm "${product.productName}" từ người bạn theo dõi đã được duyệt.`,
                });
                await followerNotification.save();

                io.to(follower.followerId.toString()).emit('notification', {
                    title: 'Sản phẩm mới từ người bạn theo dõi',
                    message: `Sản phẩm "${product.productName}" từ người bạn theo dõi đã được duyệt.`,
                    createdAt: new Date()
                });
            }

            res.json({ message: 'Sản phẩm đã được duyệt', data: product });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    }

    // Từ chối sản phẩm
    async rejectProduct(req, res, next) {
        const productId = req.params.productId;
        try {
            const product = await Product.findByIdAndUpdate(
                productId,
                { status: 'rejected' },
                { new: true }
            ).populate('sellerId');

            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

            const io = req.app.get('io');

            // Tạo và gửi thông báo cho người bán
            const notification = new Notification({
                userId: product.sellerId._id,
                title: 'Sản phẩm bị từ chối',
                message: `Sản phẩm "${product.productName}" của bạn đã bị từ chối.`,
            });
            await notification.save();

            io.to(product.sellerId._id.toString()).emit('notification', {
                title: 'Sản phẩm bị từ chối',
                message: `Sản phẩm "${product.productName}" của bạn đã bị từ chối.`,
                createdAt: new Date()
            });

            res.json({ message: 'Sản phẩm đã bị từ chối', data: product });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
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

            const products = await Product.find({ _id: { $in: productIds } }).populate('sellerId');
            const sellerProductCount = {};

            products.forEach(product => {
                const sellerId = product.sellerId._id.toString();
                if (!sellerProductCount[sellerId]) {
                    sellerProductCount[sellerId] = {
                        count: 0,
                        productNames: [],
                        sellerName: product.sellerId.name
                    };
                }
                sellerProductCount[sellerId].count += 1;
                sellerProductCount[sellerId].productNames.push(product.productName);
            });

            const io = req.app.get('io');

            for (const [sellerId, data] of Object.entries(sellerProductCount)) {
                const { count, productNames, sellerName } = data;
                
                // Xác định nội dung thông báo dựa trên status
                let actionMessage;
                if (status === 'active') {
                    actionMessage = 'duyệt';
                } else if (status === 'rejected') {
                    actionMessage = 'từ chối';
                } else {
                    actionMessage = `cập nhật thành "${status}"`; 
                }

                // Thông báo cho người bán
                const sellerNotification = new Notification({
                    userId: sellerId,
                    title: 'Cập nhật trạng thái sản phẩm',
                    message: `${count} sản phẩm của bạn (${productNames.join(', ')}) đã được "${actionMessage}".`,
                });
                await sellerNotification.save();

                io.to(sellerId).emit('notification', {
                    title: 'Cập nhật trạng thái sản phẩm',
                    message: `${count} sản phẩm (${productNames.join(', ')}) đã được "${actionMessage}".`,
                    createdAt: new Date()
                });

                // Nếu trạng thái là "active", gửi thông báo cho người theo dõi
                if (status === 'active') {
                    const followers = await Follower.find({ followingId: sellerId });
                    for (const follower of followers) {
                        const followerNotification = new Notification({
                            userId: follower.followerId,
                            title: 'Sản phẩm mới từ người bạn theo dõi',
                            message: `Có ${count} sản phẩm từ ${sellerName} vừa được duyệt.`,
                        });
                        await followerNotification.save();

                        io.to(follower.followerId.toString()).emit('notification', {
                            title: 'Sản phẩm mới từ người bạn theo dõi',
                            message: `Có ${count} sản phẩm từ ${sellerName} vừa được duyệt.`,
                            createdAt: new Date()
                        });
                    }
                }
            }

            res.json({ message: `Đã cập nhật ${productIds.length} sản phẩm thành ${status}` });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái', error: err.message });
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
