const Order = require('../models/Order');
const User = require('../models/User');

const getOrderList = async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'transportation') {
            return res.redirect('/login');
        }

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // 6 orders per page
        const skip = (page - 1) * limit;

        // Search parameter
        const search = req.query.search ? req.query.search.trim() : '';

        // Build query
        let query = {};

        if (search) {
            const isValidObjectId = search.match(/^[0-9a-fA-F]{24}$/); // Kiểm tra xem search có phải ObjectId hợp lệ không
            let userSearch = null;

            if (!isValidObjectId) {
                userSearch = await User.findOne({ email: { $regex: search, $options: 'i' } }).select('_id');
            }

            query = {
                $or: [
                    isValidObjectId ? { _id: search } : null, // Nếu search là ObjectId hợp lệ, tìm theo _id
                    userSearch ? { user: userSearch._id } : null // Nếu tìm thấy user qua email, lọc theo user._id
                ].filter(Boolean) // Xóa các phần tử null khỏi mảng
            };
        }

        // Get total number of orders for pagination
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        // Fetch orders with pagination and search
        const orders = await Order.find(query)
            .populate('user', 'email') // Populate để lấy email của user
            .populate({
                path: 'product',
                populate: [
                    { path: 'sellerId', model: 'User', select: 'name' },
                    { path: 'image', model: 'Image' }
                ]
            })
            .skip(skip)
            .limit(limit);

        // Debug: Log orders
        console.log('Fetched Orders:', JSON.stringify(orders, null, 2));

        res.render('order-list', {
            orders, 
            currentPage: page,
            totalPages,
            search
        });
    } catch (error) {
        console.error('Lỗi server:', error);
        res.status(500).render('error', { message: 'Lỗi server: ' + error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'transportation') {
            return res.status(403).json({ message: 'Chỉ transportation mới có quyền thực hiện hành động này' });
        }

        const { status } = req.body;
        const orderId = req.params.id;

        const validStatuses = ['shipping', 'delivered'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Status không hợp lệ. Chỉ chấp nhận: shipping, delivered' 
            });
        }

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        order.status = status;
        await order.save();

        res.redirect('/orderTransportation/orders');
    } catch (error) {
        res.status(500).json({ 
            message: 'Lỗi server',
            error: error.message 
        });
    }
};

module.exports = {
    getOrderList,
    updateOrderStatus
};