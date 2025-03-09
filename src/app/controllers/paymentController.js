const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

class PaymentController {
    async payment(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user._id;
        const { payment_method, address, total_price, products } = req.body;

        try {
            // Tìm tất cả sản phẩm theo danh sách ID
            const productList = await Product.find({ _id: { $in: products } });

            if (productList.length === 0) {
                return res.status(404).json({ error: "No products found" });
            }

            const groupedProducts = {};
            productList.forEach(product => {
                const sellerId = product.sellerId.toString();
                if (!groupedProducts[sellerId]) {
                    groupedProducts[sellerId] = [];
                }
                groupedProducts[sellerId].push(product);
            });

            const createdOrders = [];

            if (payment_method === "2") {
                for (const sellerId in groupedProducts) {
                    const sellerProducts = groupedProducts[sellerId];
                    const sellerProductIds = sellerProducts.map(p => p._id);

                    const newOrder = new Order({
                        user: userId,
                        product: sellerProductIds,
                        totalPrice: sellerProducts.reduce((acc, p) => acc + p.price, 0) + 7000, 
                        isPaid: false,
                    });

                    await newOrder.save();
                    createdOrders.push(newOrder);

                    await Product.updateMany(
                        { _id: { $in: sellerProductIds } },
                        { $set: { status: "sold" } }
                    );
                }
            }

            if (payment_method === "1") {
                console.log("Handling online payment (TODO)");
            }

            res.redirect('/orderTracking'); // Chuyển hướng về trang theo dõi đơn hàng
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = new PaymentController();
