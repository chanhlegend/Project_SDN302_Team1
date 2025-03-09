const Product = require("../models/Product");
const { mutipleMongoeseToObject } = require("../../util/Mongoese");
const mongoose = require("mongoose");

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

      const selledProducts = await Product.find({
        sellerId,
        status: "sold",
    }).populate("category");
    
    // Tính tổng doanh thu theo từng tháng
    const monthlyRevenue = Array(12).fill(0); // Mảng lưu tổng doanh thu của 12 tháng
    
    selledProducts.forEach(product => {
        const soldDate = new Date(product.soldAt); // Giả sử có trường soldAt lưu ngày bán
        const month = soldDate.getMonth(); // Lấy tháng (0-11)
        monthlyRevenue[month] += product.price; // Cộng dồn doanh thu
    });
    
    console.log("Monthly Revenue:", monthlyRevenue);
    res.render("statics", {
        title: "Sản phẩm của tôi",
        products: mutipleMongoeseToObject(products),
        monthlyRevenue: monthlyRevenue, 
        stats,
        user: req.user,
        currentPage: page,
        totalPages,
        limit,
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
