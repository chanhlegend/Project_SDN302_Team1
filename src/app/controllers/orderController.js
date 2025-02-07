const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

class orderController {
    createOrder(req, res, next) {
        const { productIds, userId } = req.body;  // productIds là mảng các productId và userId là ID người dùng

        // Lấy tất cả các sản phẩm từ database dựa trên mảng productIds
        Product.find({ '_id': { $in: productIds } })
            .then(products => {
                if (products.length === 0) {
                    return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
                }

                // Tính tổng giá trị của tất cả các sản phẩm
                const totalPrice = products.reduce((total, product) => total + product.price, 0);

                // Tạo đơn hàng mới
                const order = new Order({
                    product: productIds,  // Lưu mảng productIds vào đơn hàng
                    totalPrice: totalPrice.toString(),  // Tính tổng giá và chuyển thành chuỗi
                    user: userId         // Lưu userId của người mua
                });

                // Lưu đơn hàng vào database
                order.save()
                    .then(() => res.json({ message: 'success', data: order }))
                    .catch(err => res.json({ message: 'failure', data: err }));
            })
            .catch(err => res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error: err }));
    }
}
module.exports = new orderController();
