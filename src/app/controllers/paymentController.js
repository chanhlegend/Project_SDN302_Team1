require('dotenv').config();  // Nạp biến môi trường từ .env file
const Notification = require('../models/Notification');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs');

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
        
                    const io = req.app.get('io');
                    const buyer = await User.findById(userId); 
                    const notification = new Notification({
                        userId: sellerId, 
                        title: 'Đơn hàng mới',
                        message: `Bạn có đơn hàng mới từ ${buyer.name} với tổng giá ${newOrder.totalPrice}.`,
                    });

                    await notification.save();

                    io.to(sellerId).emit('notification', {
                        title: notification.title,
                        message: notification.message,
                        createdAt: notification.createdAt,
                    });
                }
            }

            if (payment_method === "1") {
                process.env.TZ = 'Asia/Ho_Chi_Minh';
                const date = new Date();
                const createDate = moment(date).format('YYYYMMDDHHmmss');

                const ipAddr =
                    req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    req.connection.socket.remoteAddress;

                // Lấy thông tin từ file .env
                const tmnCode = process.env.VNP_TMN_CODE;
                const secretKey = process.env.VNP_HASH_SECRET;
                const vnpUrl = process.env.VNP_URL;
                const returnUrl = process.env.VNP_RETURN_URL;

                const orderId = moment(date).format('DDHHmmss');
                const amount = total_price;

                let vnp_Params = {};
                vnp_Params['vnp_Version'] = '2.1.0';
                vnp_Params['vnp_Command'] = 'pay';
                vnp_Params['vnp_TmnCode'] = tmnCode;
                vnp_Params['vnp_Locale'] = 'vn';
                vnp_Params['vnp_CurrCode'] = 'VND';
                vnp_Params['vnp_TxnRef'] = orderId;
                vnp_Params['vnp_OrderInfo'] = `Thanh toan cho ma GD: ${orderId}`;
                vnp_Params['vnp_OrderType'] = 'other';
                vnp_Params['vnp_Amount'] = amount * 100;
                vnp_Params['vnp_ReturnUrl'] = returnUrl;
                vnp_Params['vnp_IpAddr'] = ipAddr;
                vnp_Params['vnp_CreateDate'] = createDate;

                if (req.body.bankCode) {
                    vnp_Params['vnp_BankCode'] = req.body.bankCode;
                }

                // Định nghĩa hàm sortObject
                function sortObject(obj) {
                    let sorted = {};
                    let str = [];
                    let key;
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            str.push(encodeURIComponent(key));
                        }
                    }
                    str.sort();
                    for (key = 0; key < str.length; key++) {
                        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
                    }
                    return sorted;
                }

                // Sắp xếp các tham số theo thứ tự alphabet trước khi tạo chữ ký
                const sortedParams = sortObject(vnp_Params);
                
                // Tạo chuỗi query không encode
                const signData = querystring.stringify(sortedParams, { encode: false });
                
                // Tạo chữ ký HMAC SHA512 đúng cách
                const hmac = crypto.createHmac('sha512', secretKey);
                const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
                
                // Thêm chữ ký vào params
                vnp_Params['vnp_SecureHash'] = signed;

                // Tạo URL thanh toán đầy đủ
                const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });
                
                // Chuyển hướng người dùng đến trang thanh toán VNPay
                return res.redirect(paymentUrl);
            }

            res.redirect('/orderTracking');
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    }

    async vnpayReturn(req, res, next) {
    try {
        const vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];
        
        // Xóa các tham số không cần thiết cho việc tạo chữ ký
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Lấy secret key từ biến môi trường
        const secretKey = process.env.VNP_HASH_SECRET;
        
        // Định nghĩa hàm sortObject
        function sortObject(obj) {
            let sorted = {};
            let str = [];
            let key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    str.push(encodeURIComponent(key));
                }
            }
            str.sort();
            for (key = 0; key < str.length; key++) {
                sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
            }
            return sorted;
        }
        
        // Sắp xếp các tham số
        const sortedParams = sortObject(vnp_Params);
        
        // Tạo chuỗi query không encode
        const signData = querystring.stringify(sortedParams, { encode: false });
        
        // Tạo chữ ký HMAC SHA512
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        // So sánh chữ ký được tạo với chữ ký nhận được
        if (secureHash === signed) {
            // Kiểm tra mã trạng thái thanh toán
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];
            
            // Nếu thanh toán thành công (mã 00)
            if (rspCode === '00') {
                // Lưu thông tin thanh toán
                const orderInfo = {
                    orderId: orderId,
                    amount: vnp_Params['vnp_Amount'] / 100, // Chuyển về đơn vị VND
                    bankCode: vnp_Params['vnp_BankCode'],
                    bankTranNo: vnp_Params['vnp_BankTranNo'],
                    cardType: vnp_Params['vnp_CardType'],
                    payDate: vnp_Params['vnp_PayDate'],
                    transactionNo: vnp_Params['vnp_TransactionNo'],
                };
                
                // Lấy thông tin sản phẩm và người dùng từ session hoặc database
                const userId = req.session.user._id;
                
                // Nhóm sản phẩm theo người bán
                // Đây là phần giả định, bạn cần triển khai theo logic cụ thể của ứng dụng
                const products = req.session.cart || [];
                
                const groupedProducts = {};
                for (const product of products) {
                    const sellerId = product.sellerId.toString();
                    if (!groupedProducts[sellerId]) {
                        groupedProducts[sellerId] = [];
                    }
                    groupedProducts[sellerId].push(product);
                }
                
                // Tạo các đơn hàng cho từng người bán
                const createdOrders = [];
                for (const sellerId in groupedProducts) {
                    const sellerProducts = groupedProducts[sellerId];
                    const sellerProductIds = sellerProducts.map(p => p._id);
                    
                    const newOrder = new Order({
                        user: userId,
                        product: sellerProductIds,
                        totalPrice: sellerProducts.reduce((acc, p) => acc + p.price, 0) + 7000, // Phí vận chuyển
                        isPaid: true, // Đã thanh toán
                        paymentMethod: "VNPay",
                        paymentInfo: orderInfo
                    });
                    
                    await newOrder.save();
                    createdOrders.push(newOrder);
                    
                    // Cập nhật trạng thái sản phẩm
                    await Product.updateMany(
                        { _id: { $in: sellerProductIds } },
                        { $set: { status: "sold" } }
                    );
                }
                
                // Xóa giỏ hàng sau khi thanh toán thành công
                req.session.cart = [];
                
                // Render trang success.ejs và truyền mã giao dịch để hiển thị
                return res.render('success', { 
                    code: orderId,
                    transactionInfo: orderInfo
                });
            } else {
                // Thanh toán thất bại, render trang error.ejs
                return res.render('error', { 
                    code: rspCode,
                    message: 'Thanh toán không thành công',
                    orderInfo: {
                        orderId: orderId,
                        amount: vnp_Params['vnp_Amount'] / 100,
                        transactionNo: vnp_Params['vnp_TransactionNo'] || 'N/A'
                    }
                });
            }
        } else {
            // Chữ ký không hợp lệ, có thể có gian lận
            return res.render('error', { 
                code: 'INVALID_SIGNATURE',
                message: 'Chữ ký không hợp lệ, có thể có gian lận',
                orderInfo: null
            });
        }
    } catch (error) {
        console.error(error);
        return res.render('error', { 
            code: 'SYSTEM_ERROR',
            message: 'Đã xảy ra lỗi hệ thống: ' + error.message,
            orderInfo: null
        });
    }
}
}

module.exports = new PaymentController();
