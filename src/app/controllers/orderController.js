const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
const { url } = require("../../config/cloudinary");
class orderController {
  async createOrder(req, res, next) {
    const { productId, userId, totalPrice } = req.body;

    try {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const order = new Order({
        product: productId,
        user: userId,
        totalPrice: totalPrice,
      });
      await order.save();
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async detailOrder(req, res, next) {
    const { id } = req.query; // Lấy id từ query string

    try {
      const order = await Order.findById(id).populate({
        path: "product", // Truy vấn sản phẩm liên quan đến đơn hàng
        populate: {
          // Sau khi lấy sản phẩm, tiếp tục populate ảnh của sản phẩm
          path: "image", // Truy vấn trường 'image' trong Product
          model: "Image", // Đảm bảo model Image
        },
      });

      if (!order) {
        return res.status(404).send("Đơn hàng không tồn tại");
      }

      res.render("detailOrder", { order });
    } catch (error) {
      console.error(error);
      res.status(500).send("Lỗi hệ thống");
    }
  }

  async cancelOrder(req, res, next) {
    const { orderId } = req.body;

    try {
      // Tìm đơn hàng theo orderId
      const order = await Order.findById(orderId);

      if (order && order.status === "Pending") {
        // Cập nhật trạng thái đơn hàng thành "Cancelled"
        order.status = "Cancelled";

        // Cập nhật trạng thái của các sản phẩm về "active"
        await Product.updateMany(
          { _id: { $in: order.product } },
          { $set: { status: "active" } }
        );

        await order.save();

        res.redirect("/orderTracking");
      } else {
        res.status(400).send("Không thể hủy đơn hàng này.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Đã xảy ra lỗi khi hủy đơn hàng.");
    }
  }
}

module.exports = new orderController();
