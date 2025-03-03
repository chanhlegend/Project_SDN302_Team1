const Product = require('../models/Product');
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');
const multer = require('multer');
const stream = require("stream");


class productOwnerController {

    async listProductowner(req, res, next) {
        const userId = req.params.userid; // Giả sử ID người dùng được lưu trong req.user
        //req.session.user.userId//req.params.userId
        const categories = await Category.find().sort({ createdAt: -1 });
    
        Product.find({ sellerId: userId }) // Lọc sản phẩm theo sellerId      
            .then(products => res.render('productOwner', { products, categories}))
            .catch(err => next(err));
    }
    

// Hiển thị form tạo sản phẩm
createProduct(req, res, next) {
    Category.find()
        .then(categories => {
            res.render('createProductOwner', { userId: req.params.userid, categories });
        })
        .catch(next);
}
create = async (req, res, next) => {
    try {
      const productData = req.body;
      const userId = req.params.userid;
      productData.sellerId = userId;

      if (!productData.category) {
        return res.status(400).send("Category is required.");
      }

      // Xử lý upload ảnh lên Cloudinary nếu có file ảnh
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "ProjectSDN302",
              public_id: `product_${Date.now()}`,
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.write(req.file.buffer);
          uploadStream.end();
        });

        productData.imageUrl = result.secure_url; // Lưu URL ảnh vào dữ liệu sản phẩm
      }

      // Tạo và lưu sản phẩm vào database
      const product = new Product(productData);
      await product.save();

      console.log("Product saved successfully!");
      res.redirect(`/productOwner/product/${userId}`);
    } catch (error) {
      console.error("Error saving product:", error);
      res.status(500).send("Failed to create product: " + error.message);
    }
  };

// Xử lý tạo sản phẩm

editProduct(req, res, next) {
    Product.findById(req.params.productid)  // Sửa lại findById
        .then(product => {
            if (!product) {
                return res.status(404).send("Product not found"); // Xử lý khi không tìm thấy sản phẩm
            }
            res.render('updateProduct', { 
                product: product,   // Truyền dữ liệu sản phẩm vào trang EJS
                userId: req.params.userid 
            });
        })
        .catch(next);
}
update(req, res, next) {
    Product.findByIdAndUpdate(req.params.productid, req.body, { new: true })
        .then(updatedProduct => {
            if (!updatedProduct) {
                return res.status(404).send("Product not found");
            }
            res.redirect('/listProductowner'); // Điều hướng về danh sách sản phẩm
        })
        .catch(next);
}
    delete(req, res, next) {
        Product.deleteOne({ productid: req.params.roductid })
            .then(() => res.redirect('/listProductowner'))
            .catch(next)
    }
}

module.exports = new productOwnerController();
