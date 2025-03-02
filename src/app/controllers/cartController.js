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
                return res.redirect('/login');
            }
    
            const userId = req.session.user._id;
    
            const cart = await Cart.findOne({ userId });
    
            if (!cart || cart.products.length === 0) {
                const message = "Giỏ hàng của bạn hiện tại đang trống!";
                return res.render('cart', { cart: { quantity: 0, message }, cartItems: [], message });
            }
    
            // const categories = await Category.find().sort({ createdAt: -1 });
    
            const cartItems = await Product.find({ 
                _id: { $in: cart.products },
                status: { $ne: "sold" }  
            }).populate('sellerId', 'name');
            // res.json(cartItems);
            res.render('cart', { cart, cartItems });
        } catch (err) {
            console.error("Lỗi khi lấy giỏ hàng:", err);
            res.status(500).json({ error: "Lỗi server, thử lại sau" });
        }
    }
    

    async removeFromCart(req, res, next) {
        try {
            if (!req.session.user) {
                return res.redirect('/login');
            }
    
            const userId = req.session.user._id;
            let { productIds } = req.body; 
            if (!productIds) {
                return res.status(400).json({ error: "Không có sản phẩm nào được chọn để xóa!" });
            }
    
            if (typeof productIds === "string") {
                try {
                    productIds = JSON.parse(productIds);
                } catch (error) {
                    return res.status(400).json({ error: "Dữ liệu không hợp lệ!" });
                }
            }
    
            if (!Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ error: "Danh sách sản phẩm cần xóa không hợp lệ!" });
            }
    
            const cart = await Cart.findOne({ userId });
    
            if (!cart || cart.products.length === 0) {
                return res.status(404).json({ error: "Giỏ hàng không có sản phẩm!" });
            }
    
            cart.products = cart.products.filter(productId => !productIds.includes(productId.toString()));
            cart.quantity = cart.products.length;
    
            if (cart.products.length > 0) {
                await cart.save();
                return res.redirect('cart'); 
            } else {
                cart.message = "Giỏ hàng của bạn hiện tại đang trống!";
                await cart.save(); 
                return res.redirect('cart'); 
            }
    
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            res.status(500).json({ error: "Lỗi server, thử lại sau" });
        }
    }
}

module.exports = new cartController;