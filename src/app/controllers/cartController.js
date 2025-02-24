const Cart = require ("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");
class cartController {
    async addToCart(req, res, next) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
            }

            const userId = req.session.user._id;
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: "Thiếu id" });
            }

            let cart = await Cart.findOne({ userId });

            if (!cart) {
                cart = new Cart({
                    userId,
                    products: [id],
                    quantity: 1 
                });
            } else {
                if (!cart.products.includes(id)) {
                    cart.products.push(id);
                    cart.quantity += 1;
                }

                
            }

            await cart.save();
            res.redirect('/cart');
        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err);
            res.status(500).json({ error: "Lỗi server, thử lại sau" });
        }
    }

    async listCartByUser(req, res, next) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
            }
    
            const userId = req.session.user._id;
    
            const cart = await Cart.findOne({ userId });
    
            if (!cart || cart.products.length === 0) {
                // Giỏ hàng trống, thiết lập các giá trị mặc định cho cart
                const message = "Giỏ hàng của bạn hiện tại đang trống!";
                return res.render('cart', { cart: { quantity: 0, message }, cartItems: [], message });
            }
            
            const categories = await Category.find().sort({ createdAt: -1 });
            
            const cartItems = await Product.find({ _id: { $in: cart.products } }).populate('sellerId', 'name');
    
            res.render('cart', { cart, cartItems ,categories });
        } catch (err) {
            console.error("Lỗi khi lấy giỏ hàng:", err);
            res.status(500).json({ error: "Lỗi server, thử lại sau" });
        }
    }

    async removeFromCart(req, res, next) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
            }
    
            const userId = req.session.user._id;
            const { id } = req.body;
    
            // Tìm giỏ hàng của người dùng
            const cart = await Cart.findOne({ userId });
    
            if (!cart || cart.products.length === 0) {
                return res.status(404).json({ error: "Giỏ hàng không có sản phẩm!" });
            }
    
            // Loại bỏ sản phẩm khỏi mảng products
            cart.products.pull(id);
            cart.quantity -= 1;
    
            // Nếu giỏ hàng còn sản phẩm, lưu lại giỏ hàng
            if (cart.products.length > 0) {
                await cart.save();
                return res.redirect('/cart'); // Sau khi xóa sản phẩm, điều hướng về giỏ hàng
            } else {
                // Nếu giỏ hàng trống, không xóa giỏ hàng mà hiển thị thông báo
                cart.message = "Giỏ hàng của bạn hiện tại đang trống!";
                await cart.save(); // Cập nhật trạng thái giỏ hàng
                return res.redirect('/cart'); // Chuyển hướng về trang giỏ hàng với thông báo
            }
    
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            res.status(500).json({ error: "Lỗi server, thử lại sau" });
        }
    }

    
    
}

module.exports = new cartController;