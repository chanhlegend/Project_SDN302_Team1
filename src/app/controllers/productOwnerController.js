const Product = require('../models/Product');
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const cloudinary = require('../../config/cloudinary');
const Image = require('../models/Image'); // Adjust the path as needed
const path = require('path');
const fs = require('fs');
const multer = require('multer');
class productOwnerController {
    async listProductOwner(req, res, next) {
        try {
            const userId = req.params.userid; // Lấy userId từ params
    
            // Lấy danh sách các danh mục sản phẩm
            const categories = await Category.find().sort({ createdAt: -1 });
    
            // Lấy sản phẩm của người bán và populate trường image
            let products = await Product.find({ sellerId: userId })
                .populate('image') // Populate để lấy dữ liệu từ collection Image
                .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
    
            // Kiểm tra và log dữ liệu để debug (tùy chọn)
            console.log('userId:', userId); // Thêm log để debug
    
            // Render trang EJS và truyền cả userId vào view
            res.render('productOwner', { products, categories, userId });
        } catch (err) {
            next(err); // Nếu có lỗi, gọi next để chuyển đến middleware xử lý lỗi
        }
    }
// GET /create/:userid
createProduct(req, res, next) {
    Category.find()
        .then(categories => {
            res.render('createProductOwner', { userId: req.params.userid, categories });
        })
        .catch(next);
}
// POST /create/:userid
async create(req, res, next) {
    console.log("Dữ liệu nhận được từ form:", req.body);
    console.log("User ID from params:", req.params.userid);

    const productData = req.body;
    const userId = req.params.userid;

    // Đảm bảo category được cung cấp
    if (!productData.category) {
        return res.status(400).send('Category is required.');
    }

    // Validate userId
    if (!userId || userId.trim() === '') {
        console.error('Seller ID is missing or empty in request params');
        return res.status(400).send('Seller ID is required.');
    }

    // Xử lý mảng các URL ảnh từ form
    let imageIds = [];
    if (productData.imageUrls) {
        try {
            // Parse mảng imageUrls từ JSON
            const imageUrls = JSON.parse(productData.imageUrls);

            // Giới hạn tối đa 6 ảnh
            if (imageUrls.length > 6) {
                return res.status(400).send('Maximum 6 images allowed per product.');
            }

            // Tạo document Image cho từng URL
            const imagePromises = imageUrls.map(async (url) => {
                const newImage = new Image({
                    url: url
                });
                const savedImage = await newImage.save();
                return savedImage._id;
            });

            // Chờ tất cả document Image được lưu
            imageIds = await Promise.all(imagePromises);
        } catch (error) {
            console.error('Error parsing image URLs or saving images:', error);
            return res.status(500).send('Failed to save images: ' + error.message);
        }
    }

    // Lưu sản phẩm
    saveProduct(imageIds);

    // Hàm lưu sản phẩm
    function saveProduct(imageIds) {
        productData.sellerId = userId; // Gán sellerId từ userId
        productData.image = imageIds; // Gán mảng imageIds vào trường image

        const product = new Product(productData);
        product.save()
            .then(() => {
                console.log("Product saved successfully!");
                res.redirect(`/productOwner/product/${userId}`);
            })
            .catch(error => {
                console.error('Error saving product:', error);
                res.status(500).send('Failed to create product: ' + error.message);
            });
    }
}
editProduct(req, res, next) {
    Promise.all([
        Product.findById(req.params.productid).populate('image'),
        Category.find()
    ])
    .then(([product, categories]) => {
        if (!product) {
            return res.status(404).send("Product not found");
        }
        if (product.sellerId.toString() !== req.params.userid) {
            return res.status(403).send("You are not authorized to edit this product");
        }
        console.log("Product.image:", product.image);
        console.log("Categories from DB:", categories);
        res.render('updateProduct', { 
            product: product, 
            userId: req.params.userid,
            categories: categories
        });
    })
    .catch(next);
}

update(req, res, next) {
    console.log("Received request method:", req.method); // Kiểm tra phương thức
    console.log("Received params:", req.params);        // Kiểm tra productid
    console.log("Received body:", req.body);            // Kiểm tra dữ liệu gửi lên
    const userId = req.body.userId;
    Product.findById(req.params.productid)
        .populate('image')
        .then(product => {
            if (!product) {
                return res.status(404).send("Product not found");
            }
            if (product.sellerId.toString() !== userId) {
                return res.status(403).send("You are not authorized to update this product");
            }

            const { productName, price, description, category, currentImageUrls, newImageUrls } = req.body;
            if (!productName || !price || !category) {
                return res.status(400).send("Product name, price, and category are required");
            }
            if (price <= 0) {
                return res.status(400).send("Price must be greater than 0");
            }

            return (async () => {
                let imageIds = [];
                if (currentImageUrls && Array.isArray(currentImageUrls)) {
                    imageIds = product.image
                        .filter(img => currentImageUrls.includes(img.url))
                        .map(img => img._id);
                }

                if (newImageUrls) {
                    const newUrls = JSON.parse(newImageUrls);
                    if ((imageIds.length + newUrls.length) > 6) {
                        return res.status(400).send("Maximum 6 images allowed.");
                    }

                    const newImagePromises = newUrls.map(async (url) => {
                        const newImage = new Image({ url });
                        const savedImage = await newImage.save();
                        return savedImage._id;
                    });
                    const newImageIds = await Promise.all(newImagePromises);
                    imageIds = [...imageIds, ...newImageIds];
                }

                if (imageIds.length === 0) {
                    return res.status(400).send("At least one image is required.");
                }

                const updateData = {
                    productName,
                    price,
                    description,
                    category,
                    image: imageIds
                };
                return Product.findByIdAndUpdate(req.params.productid, updateData, { new: true })
                    .then(updatedProduct => {
                        if (!updatedProduct) {
                            return res.status(404).send("Product not found");
                        }
                        res.redirect(`/productOwner/product/${userId}`);
                    });
            })();
        })
        .catch(err => {
            console.error("Error in update:", err); // Log lỗi nếu có
            next(err);
        });
}
delete(req, res, next) {
    const userId = req.params.userid; // Lấy userId từ req.params
    Product.deleteOne({ _id: req.params.productid })
        .then(() => res.redirect(`/productOwner/product/${userId}`))
        .catch(next);
}
}

module.exports = new productOwnerController();
