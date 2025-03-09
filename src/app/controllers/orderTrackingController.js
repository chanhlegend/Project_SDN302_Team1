const Order = require('../models/Order');
const Category = require('../models/Category')
class OrderTrackingController {
    async renderOrderTracking(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        let categories = await Category.find().sort({ createdAt: -1 });
        res.render('orderTracking', { orders: [], select: "0" ,categories });
    }

    async listOrder(req, res, next) {
        if (!req.session.user) {
            return res.status(401).json({ error: "Bạn cần đăng nhập." });
        }

        const userId = req.session.user._id;
        const { select } = req.body;

        try {
            let filter = { user: userId };

            if (select !== "0") {
                const statusMap = {
                    "1": "Pending",
                    "2": "Processing",
                    "3": "Shipped",
                    "4": "Delivered",
                    "5": "Cancelled"
                };

                if (statusMap[select]) {
                    filter.status = statusMap[select];
                }
            }

            const orders = await Order.find(filter).populate({
                path: "product",
                select: "productName price image description sellerId"
            });

            if (orders.length === 0) {
                return res.json({ message: "Không có đơn hàng nào.", orders: [] });
            }
            let categories = await Category.find().sort({ createdAt: -1 });
            return res.json({ message: "Danh sách đơn hàng", orders, categories });

        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng:", error);
            return res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
        }
    }
}

module.exports = new OrderTrackingController();
