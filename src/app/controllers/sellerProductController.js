const Product = require("../models/Product");
const { mutipleMongoeseToObject } = require("../../util/Mongoese");
const mongoose = require("mongoose");
const Category = require('../models/Category');

class SellerDashboardController {
  async getMyProducts(req, res, next) {
    try {
      const userId = req.session.user ? req.session.user._id : null;
      const user = req.session.user;
      if (!userId) {
        req.session.message = {
          type: "error",
          content: "Bạn cần đăng nhập để xem sản phẩm của mình",
        };
        return res.redirect("/login");
      }

      if (user.role !== "seller") {
        req.session.message = {
          type: "error",
          content: "Bạn không có quyền truy cập trang này",
        };
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const sellerId = new mongoose.Types.ObjectId(userId);
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let skip = (page - 1) * limit;

      const totalProducts = await Product.countDocuments({ sellerId });
      const products = await Product.find({ sellerId })
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalProducts / limit);
      const stats = {
        totalProducts,
        activeProducts: await Product.countDocuments({
          sellerId,
          status: "active",
        }),
        pendingProducts: await Product.countDocuments({
          sellerId,
          status: "non-active",
        }),
        soldProducts: await Product.countDocuments({
          sellerId,
          status: "sold",
        }),
      };

      const soldProducts  = await Product.find({
        sellerId,
        status: "sold",
    }).populate("category");
    

    const monthlyRevenue = Array(12).fill(0); 
    const categories = await Category.find(); 

    soldProducts.forEach((product) => {
      if (product.updatedAt) {
        const updatedDate = new Date(product.updatedAt);
        const month = updatedDate.getMonth(); // Lấy tháng (0-11)
        monthlyRevenue[month] += product.price;
      }
    });
 
    
    res.render("statics", {
        title: "Sản phẩm của tôi",
        products: mutipleMongoeseToObject(products),
        monthlyRevenue,
        stats,
        user: req.user,
        currentPage: page,
        totalPages,
        limit,
        categories
    });

    } catch (error) {
      console.error("Lỗi trong getMyProducts:", error);
      req.session.message = {
        type: "error",
        content: "Không thể tải danh sách sản phẩm",
      };
      res.redirect("/");
    }
  }
}

module.exports = new SellerDashboardController();
